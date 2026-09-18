import {
    uploadFile,
    getAllFiles,
    getFileStream,
    getZipStream,
    deleteFile
} from "../config/fileStorage.js";

/* ------------------------------------------------------------------
   ✅ Upload single file
------------------------------------------------------------------ */
export const uploadSingleFile = async (file) => {
    let uploaded, duplicate;

    try {
        const res = await uploadFile(file.buffer, file.originalname, file.mimetype);

        /* --------------------------------------------------
            If duplicate found:
            - Do not create file again
            - But attach existing file info to compliance data
        -------------------------------------------------- */
        if (res?.duplicate && res?.file) {
            duplicate = file.originalname;
            uploaded = res.file;
        }

        /* --------------------------------------------------
            New uploaded file
        -------------------------------------------------- */
        else if (res?.file) {
            uploaded = res.file;
        }

        return { uploaded, duplicate };
    } catch (err) {
        console.error("Upload error:", err);
        uploaded = file.originalname;
    }
};

/* ------------------------------------------------------------------
   ✅ Upload multiple files
------------------------------------------------------------------ */
export const uploadMultipleFiles = async (files = []) => {
    const uploaded = [];
    const duplicates = [];

    await Promise.allSettled(
        files.map(async (f) => {
            try {
                const res = await uploadFile(f.buffer, f.originalname, f.mimetype);

                /* --------------------------------------------------
                   If duplicate found:
                   - Do not create file again
                   - But attach existing file info to compliance data
                -------------------------------------------------- */
                if (res?.duplicate && res?.file) {
                    duplicates.push(f.originalname);
                    uploaded.push(res.file);
                }

                /* --------------------------------------------------
                   New uploaded file
                -------------------------------------------------- */
                else if (res?.file) {
                    uploaded.push(res.file);
                }

            } catch (err) {
                console.error("Upload error:", err);
                uploaded.push("Upload failed"+f.originalname);
            }
        })
    );

    return { uploaded, duplicates };
};

/* ------------------------------------------------------------------
   ✅ Get all files
------------------------------------------------------------------ */
export const getFiles = async () => {
    return await getAllFiles();
};

/* ------------------------------------------------------------------
   ✅ Download single file
------------------------------------------------------------------ */
export const getFileById = async (fileId) => {
    return await getFileStream(fileId);
};

/* ------------------------------------------------------------------
   ✅ Download multiple files ZIP
------------------------------------------------------------------ */
export const downloadFilesZip = async (ids = []) => {
    return await getZipStream(ids);
};

/* ------------------------------------------------------------------
   ✅ Delete single file
------------------------------------------------------------------ */
export const removeFile = async (fileId) => {
    return await deleteFile(fileId);
};

/* ------------------------------------------------------------------
   ✅ Delete multiple files
------------------------------------------------------------------ */
export const deleteFiles = async (ids = []) => {
    const results = [];

    await Promise.allSettled(
        ids.map(async (id) => {
            try {
                const res = await deleteFile(id);
                results.push({
                    success: true,
                    ...res
                });
            } catch (err) {
                results.push({
                    success: false,
                    _id: id,
                    message: err.message
                });
            }
        })
    );

    return results;
};