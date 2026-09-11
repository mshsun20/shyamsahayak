import mongoose from "mongoose";
const { Schema, model, Types } = mongoose;

const AccountSchema = new Schema({
    userId: { type: String, required: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    privilege: { type: Types.ObjectId, ref: "Privilege", required: true },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    username: { type: String, trim: true },
    employeeId: { type: String, trim: true },
    password: { type: String, required: true, trim: true },
    passwordBackup: { type: String, required: true, trim: true },
    passwordChangeFlag: { type: Boolean, default: false },
    role: { type: Types.ObjectId, ref: "Role" },
    reportingDetails: [{
        reportingManager: { type: Types.ObjectId, ref: "Account" },
        territory: { type: String, trim: true },
        district: { type: String, trim: true },
        // territory: { type: Types.ObjectId, ref: "Territory" },
        // district: { type: Types.ObjectId, ref: "District" },
    }],
    remarks: { type: String, trim: true },
    status: { type: String, required: true, enum: ["Active", "Inactive", "Needs Attention"], default: "Active" },
    createdBy: { type: Types.ObjectId, ref: "Account" },
    updatedBy: { type: Types.ObjectId, ref: "Account" },
}, { timestamps: true });

const Account = model("Account", AccountSchema);

export default Account;