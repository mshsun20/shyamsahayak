import mongoose from "mongoose";
const { Schema, model, Types } = mongoose;

const VisitSchema = new Schema({}, { timestamps: true });

const Visit = model("Visit", VisitSchema)

export default Visit;