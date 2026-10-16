import mongoose from "mongoose";
const { Schema, model, Types } = mongoose;

const AccountSchema = new Schema({
    userId: { type: String, required: true, trim: true, index: true },
    fullName: { type: String, required: true, trim: true, index: true },
    privilege: { type: Types.ObjectId, ref: "Privilege", required: true },
    email: { type: String, trim: true, index: true },
    phone: { type: String, trim: true, index: true },
    age: { type: String, trim: true }, // new
    role: { type: Types.ObjectId, ref: "Role" },
    username: { type: String, trim: true, index: true },
    employeeId: { type: String, trim: true, index: true },
    password: { type: String, required: true, trim: true },
    passwordBackup: { type: String, required: true, trim: true },
    passwordChangeFlag: { type: Boolean, default: false },
    permissions: [{ type: Types.ObjectId, ref: "Permission" }],
    state: { type: String, trim: true }, // new
    district: { type: String, trim: true }, // new
    reportingManagers: { type: Types.ObjectId, ref: "Account" }, // new
    identityType: { type: String, trim: true }, // new
    identityNumber: { type: String, trim: true }, // new
    image: { type: Types.ObjectId, ref: "File" }, // new
    points: { type: String, trim: true }, // new
    club: { type: String, trim: true }, // new
    remarks: { type: String, trim: true },
    blockStatus: { type: String, enum: ["Active", "Blocked"], default: "Active", index: true }, // new
    status: { type: String, required: true, enum: ["Active", "Inactive", "Needs Attention"], default: "Active", index: true },
    createdBy: { type: Types.ObjectId, ref: "Account" },
    updatedBy: { type: Types.ObjectId, ref: "Account" },
}, { timestamps: true });

const Account = model("Account", AccountSchema);

export default Account;