import mongoose from "mongoose";
import env from "./env.js";

mongoose.set("strictQuery", false); // Disable strict query mode
const connectDB = async () => {
    try {
        await mongoose.connect(env.dbUrl, {
            dbName: env.dbName,
            retryWrites: true,
            w: 'majority',
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        });
        console.log("MongoDB connected successfully...");
    }
    catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1); // Exit the process with failure
    }
};

export default connectDB;