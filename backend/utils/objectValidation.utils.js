import mongoose from "mongoose";

export const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(String(id));

export const mapValidObjectId = (id) => {
    if (isValidObjectId(String(id))) return id;
    else return new mongoose.Types.ObjectId(String(id));
};