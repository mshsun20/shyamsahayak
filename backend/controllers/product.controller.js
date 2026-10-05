import {
    createFunction,
    readFunction,
    readByIdFunction,
    readByUniqueKeyFunction,
    updateFunction,
    deleteFunction
} from "../services/product.service.js";
import {
    uploadSingleFile,
} from "../services/file.service.js";
import { mapValidObjectId } from "../utils/objectValidation.util.js";

const create = async (req, res) => {
    try {
        const productPayload = req.body;
        const user = req.user || null;
        const file = req.file || null;
        console.log(file);
        if (file && file?.size > 0) {
            const uploadReport = await uploadSingleFile(file)
            console.log(uploadReport);
            productPayload.image = uploadReport?.uploaded?._id || null;
        }
        
        const existingProduct = await readByUniqueKeyFunction(String(productPayload.code).trim());
        if (existingProduct) return res.status(409).json({ success: false, message: "Product already exists" });
        
        Object.assign(productPayload, {
            status: productPayload.status || "Draft",
            createdBy: user?._id || null,
        })
        const product = await createFunction(productPayload);
        if (!product) return res.status(401).json({ success: false, message: "Product creation failed" });
        return res.status(201).json({
            success: true,
            message: "Product created succesfully",
            data: product
        });
    } catch (error) {
        console.error(error.message);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}
const upload = async (req, res) => {
    try {
        const productDataSheet = req.body?.products || [];
        const user = req.user || null;
        productDataSheet?.forEach(async (product, i) => {
            const tags = String(product.tags || "").split(",").map((t) => String(t || "").trim()).filter((t) => t.length > 0);
            const existingProduct = await readByUniqueKeyFunction(String(product.code).trim());
            if (existingProduct) {
                Object.assign(product, {
                    tags: tags,
                    status: product.status || "Draft",
                    updatedBy: user?._id || null,
                })
                const { code, ...newPayload } = product;
                const updatedUpload = await updateFunction(existingProduct?._id, newPayload);
                // console.log(updatedUpload);
                productDataSheet[i].uploadReport = updatedUpload;
            }
            else {
                Object.assign(product, {
                    tags: tags,
                    status: product.status || "Draft",
                    createdBy: user?._id || null,
                })
                const newUpload = await createFunction(product);
                productDataSheet[i].uploadReport = newUpload;
            }
        });
        if (productDataSheet?.length > 0) {
            console.log(productDataSheet);
            return res.status(201).json({
                success: true,
                message: "Product bulk imported done",
                data: productDataSheet
            })
        }
    } catch (error) {
        console.error(error.message);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}
const read = async (req, res) => {
    try {
        const products = await readFunction();
        res.status(200).json({
            success: true,
            message: "All Products fetched successfully",
            data: products
        });
    } catch (error) {
        console.error(error.message);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}
const readById = async (req, res) => {
    try {
        const id = mapValidObjectId(req.params.id);
        const productDetails = await readByIdFunction(id);
        res.status(200).json({
            success: true,
            message: "Product details fetched successfully",
            data: productDetails
        });
    } catch (error) {
        console.error(error.message);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}
const readByUniqueKey = async (req, res) => {
    try {
        const uniqueKey = String(req.params.key || "").trim();
        const productDetails = await readByUniqueKeyFunction(uniqueKey);
        res.status(200).json({
            success: true,
            message: "Product details fetched successfully",
            data: productDetails
        });
    } catch (error) {
        console.error(error.message);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}
const update = async (req, res) => {
    try {
        const id = mapValidObjectId(req.params.id);
        const productPayload = req.body;
        const user = req.user || null;
        const file = req.file || null;
        console.log(file);
        if (file && file?.size > 0) {
            const uploadReport = await uploadSingleFile(file)
            console.log(uploadReport);
            productPayload.image = uploadReport?.uploaded?._id || null;
        }
        
        const existingProduct = await readByIdFunction(id);
        if (!existingProduct) return res.status(404).json({ success: false, message: "Product doesn't exist" });

        const items = ["_id", "code"]
        for (const key of items) {
            delete productPayload[key]
        }
        Object.assign(productPayload, {
            status: productPayload.status || "Draft",
            updatedBy: user?._id || null,
        })
        const updatedProduct = await updateFunction(id, productPayload);
        if (!updatedProduct) return res.status(401).json({ success: false, message: "Product update failed" });
        return res.status(201).json({
            success: true,
            message: "Product details updated successfully",
            data: updatedProduct
        })
    } catch (error) {
        console.error(error.message);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}
const remove = async (req, res) => {
    try {
        const id = mapValidObjectId(req.params.id);
        const existingProduct = await readByIdFunction(id);
        if (!existingProduct) return res.status(404).json({ success: false, message: "Product doesn't exist" });

        const removalDetails = await deleteFunction(id);
        if (!removalDetails) return res.status(400).json({ success: false, message: "Product removal failed" });
        return res.status(200).json({
            success: true,
            message: "Product removed successfully",
            data: removalDetails
        })
    } catch (error) {
        console.error(error.message);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

const Product = { create, upload, read, readById, readByUniqueKey, update, remove }

export default Product;