import mongoose from "mongoose";
const { Schema, model } = mongoose;

// One document per sequence (e.g. "metric", "thickness"); seq is incremented atomically.
const CounterSchema = new Schema({
    _id: { type: String, required: true },
    seq: { type: Number, required: true, default: 0 },
}, { versionKey: false });

const Counter = model("Counter", CounterSchema);

export default Counter;
