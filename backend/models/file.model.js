import mongoose from "mongoose";

const { Schema, model } = mongoose;

const FileSchema = new Schema({
    filename: String,
    originalname: String,
    mimetype: String,
    size: Number,
    path: String,
    relativePath: String,
    hash: String
}, { timestamps: true });

FileSchema.index({ hash: 1 }, { unique: true });

const File = model("File", FileSchema);

export default File;