// // ✅ Multer config
import multer from "multer";
import env from "../config/env.js";

const fileCounts = env.uploadCount;
const fileSizeMB = env.uploadSize;

const storage = multer.memoryStorage();

const fileUpload = multer({
    storage,
    limits: {
        files: fileCounts,
        fileSize: fileSizeMB * 1024 * 1024,
    },
});

export default fileUpload;