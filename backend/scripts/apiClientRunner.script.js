import mongoose from "mongoose";
import env from "../config/env.js";
import ApiClient from "../models/apiClient.model.js";
import { createApiClient } from "../services/apiClient.service.js";

const run = async () => {
    try {
        await mongoose.connect(env.dbUrl);
        console.log("MongoDB connected.");

        // ============================================================
        // API CLIENT CONFIGURATION
        // ============================================================
        const clientId = "roofmasters";
        const name = "Roofmasters";
        const permissions = [
            "sahayak:data:create",
            "account:read",
        ];
        const description = "Roofmasters integration with Sahayak";
        const expiresAt = null;

        // ============================================================
        // CHECK EXISTING API CLIENT
        // ============================================================
        const existingClient = await ApiClient.findOne({ clientId }).lean();

        // ============================================================
        // CASE 1: API CLIENT ALREADY EXISTS
        // ============================================================
        if (existingClient) {
            console.log("\n=================================");
            console.log("API CLIENT ALREADY EXISTS");
            console.log("=================================\n");
            console.log("Client ID :", existingClient.clientId);
            console.log("Name      :", existingClient.name);
            console.log("Status    :", existingClient.status);
            console.log("\nExisting permissions:", existingClient.permissions || []);

            // --------------------------------------------------------
            // Append new permissions without duplicates
            // --------------------------------------------------------
            const result = await ApiClient.updateOne(
                { clientId },
                { $addToSet: { permissions: { $each: permissions } } }
            );
            if (result.modifiedCount > 0) {
                console.log("\nNew permissions added successfully.");
            } else {
                console.log("\nNo permission changes required.");
            }

            // --------------------------------------------------------
            // Fetch updated client
            // --------------------------------------------------------
            const updatedClient = await ApiClient.findOne({ clientId }).lean();
            console.log("\n=================================");
            console.log("UPDATED API CLIENT");
            console.log("=================================\n");
            console.log("Client ID   :", updatedClient.clientId);
            console.log("Name        :", updatedClient.name);
            console.log("Status      :", updatedClient.status);
            console.log("Prefix      :", updatedClient.keyPrefix);
            console.log("Permissions :", updatedClient.permissions || []);
            console.log("\nExisting API key remains unchanged.");
        }

        // ============================================================
        // CASE 2: API CLIENT DOES NOT EXIST
        // ============================================================
        else {
            console.log("\n=================================");
            console.log("API CLIENT NOT FOUND");
            console.log("=================================\n");
            console.log(`Creating new API client: ${clientId}`);
            const { client, apiKey } = await createApiClient({
                clientId,
                name,
                permissions,
                description,
                expiresAt,
            });

            console.log("\n=================================");
            console.log("API CLIENT CREATED");
            console.log("=================================\n");
            console.log("Client ID   :", client.clientId);
            console.log("Name        :", client.name);
            console.log("Status      :", client.status);
            console.log("Prefix      :", client.keyPrefix);
            console.log("Permissions :", client.permissions);
            console.log("\nRAW API KEY:");
            console.log(apiKey);
            console.log("\n=================================");
            console.log("IMPORTANT");
            console.log("=================================");
            console.log("Save this API key securely.");
            console.log("The raw API key is NOT stored in MongoDB.");
            console.log("It cannot be recovered later.");
        }

    } catch (error) {
        console.error("\nFailed to process API client:", error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

run();