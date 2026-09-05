import mongoose from "mongoose";
const { Schema, model } = mongoose;

const AccountSchema = new Schema({}, { timestamps: true });

const Account = model("Account", AccountSchema);

export default Account;