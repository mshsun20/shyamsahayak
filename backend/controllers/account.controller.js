import {
    createFunction,
    readFunction,
    readByIdFunction,
    readByUniqueKeyFunction,
    updateFunction,
    deleteFunction
} from "../services/account.service.js";
import {
    readByIdFunction as readPrivilegeById
} from "../services/privilege.service.js";
import { mapValidObjectId } from "../utils/objectValidation.util.js";
import {
    hashPassword
} from "../utils/passwordHash.util.js";

// reusable functions
const uniqueIdGen = async (payload) => {
    const accountPrivilege = await readPrivilegeById(mapValidObjectId(payload?.privilege));
    if (parseInt(accountPrivilege.heirarchy) > 2) {
        return payload.employeeId;
    }
    else {
        return payload.username;
    }
}

// handler functions
const create = async (req, res) => {
    try {
        const accountPayload = req.body;
        const user = req.user || null;
        
        accountPayload.userId = await uniqueIdGen(accountPayload);
        const existingAccount = await readByUniqueKeyFunction(String(accountPayload.userId).trim());
        if (existingAccount) return res.status(409).json({ success: false, message: "Account already exists" });
        
        Object.assign(accountPayload, {
            password: hashPassword(accountPayload.password),
            passwordBackup: accountPayload.password,
            createdBy: user?._id || null,
            status: "Active",
        })
        const account = await createFunction(accountPayload);
        if (!account) return res.status(401).json({ success: false, message: "Account creation failed" });
        return res.status(201).json({
            success: true,
            message: "Account created succesfully",
            data: account
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
        const accountDataSheet = req.body?.accounts;
        const user = req.user || null;
        // let newAccounts = []
        accountDataSheet?.forEach(async (account, i) => {
            account.userId = await uniqueIdGen(account);
            const existingAccount = await readByUniqueKeyFunction(String(accountPayload.userId).trim());

            if (existingAccount) {
                Object.assign(account, {
                    updatedBy: user?._id || null,
                    status: "Active",
                })
                const updatedUpload = await updateFunction(existingAccount?._id, account);
                console.log(updatedUpload);
                accountDataSheet[i].uploadReport = updatedUpload;
            }
            else {
                Object.assign(account, {
                    password: hashPassword(account.password),
                    passwordBackup: account.password,
                    createdBy: user?._id || null,
                    status: "Active",
                })
                const newUpload = await createFunction(account);
                console.log(newUpload);
                accountDataSheet[i].uploadReport = newUpload;
            }
        })
        if (accountDataSheet?.length > 0) {
            console.log(accountDataSheet);
            return res.status(201).json({
                success: true,
                message: "Account data sheet uploaded",
                data: accountDataSheet
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
        const accounts = await readFunction();
        res.status(200).json({
            success: true,
            message: "All Accounts fetched successfully",
            data: accounts
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
        const accountDetails = await readByIdFunction(id);
        res.status(200).json({
            success: true,
            message: "Account details fetched successfully",
            data: accountDetails
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
        const accountDetails = await readByUniqueKeyFunction(uniqueKey);
        res.status(200).json({
            success: true,
            message: "Account details fetched successfully",
            data: accountDetails
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
        const accountPayload = req.body;
        const user = req.user || null;
        const existingAccount = await readByIdFunction(id);
        if (!existingAccount) return res.status(404).json({ success: false, message: "Account doesn't exist" });

        const items = ["_id", "username"]
        for (const key of items) {
            delete accountPayload[key]
        }
        Object.assign(accountPayload, {
            updatedBy: user?._id || null,
            status: "Active",
        })
        const updatedAccount = await updateFunction(id, accountPayload);
        if (!updatedAccount) return res.status(401).json({ success: false, message: "Account update failed" });
        return res.status(201).json({
            success: true,
            message: "Account details updated successfully",
            data: updatedAccount
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
        const existingAccount = await readByIdFunction(id);
        if (!existingAccount) return res.status(404).json({ success: false, message: "Account doesn't exist" });

        const removalDetails = await deleteFunction(id);
        if (!removalDetails) return res.status(400).json({ success: false, message: "Account removal failed" });
        return res.status(200).json({
            success: true,
            message: "Account removed successfully",
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

const Account = { create, upload, read, readById, readByUniqueKey, update, remove };
export default Account;