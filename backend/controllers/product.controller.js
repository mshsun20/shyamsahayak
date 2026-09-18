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

const create = async (req, res) => {
    try {
        const productPayload = req.body;
        const user = req.user || null;
        const file = req.file.image || null;
        const upload = await uploadSingleFile(file)
        console.log(upload);
        
        const existingProduct = await readByUniqueKeyFunction(String(productPayload.name).trim());
        if (existingProduct) return res.status(409).json({ success: false, message: "Product already exists" });
        
        Object.assign(productPayload, {
            // image: upload,
            createdBy: user?._id || null,
            status: "Active",
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
        const existingProduct = await readByIdFunction(id);
        if (!existingProduct) return res.status(404).json({ success: false, message: "Product doesn't exist" });

        const items = ["_id", "name"]
        for (const key of items) {
            delete productPayload[key]
        }
        Object.assign(productPayload, {
            updatedBy: user?._id || null,
            status: "Active",
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

const Product = { create, read, readById, readByUniqueKey, update, remove }

export default Product;