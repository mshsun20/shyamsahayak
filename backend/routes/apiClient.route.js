import express from "express";
const apiClientRouter = express.Router();
import ApiClient from "../controllers/apiClient.controller.js";
import { unifiedAuthProtect } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/permission.middleware.js";


apiClientRouter.use(unifiedAuthProtect);

// Create
apiClientRouter.post("/", requirePermission("api-client:create"), ApiClient.create);
// Read all
apiClientRouter.get("/", requirePermission("api-client:read"), ApiClient.read);
// Read one
apiClientRouter.get("/:id", requirePermission("api-client:read"), ApiClient.readById);
// Update basic details
apiClientRouter.patch("/:id", requirePermission("api-client:update"), ApiClient.update);
// Add permissions
apiClientRouter.patch("/:id/permissions", requirePermission("api-client:update"), ApiClient.addPermissions);
// Remove one permission
apiClientRouter.delete("/:id/permissions", requirePermission("api-client:update"), ApiClient.removePermission);
// Revoke
apiClientRouter.patch("/:id/revoke", requirePermission("api-client:update"), ApiClient.revoke);
// Regenerate API key
apiClientRouter.post("/:id/regenerate-key", requirePermission("api-client:update"), ApiClient.regenerateKey);
// Delete
apiClientRouter.delete("/:id", requirePermission("api-client:delete"), ApiClient.remove);

// apiClientRouter.post("/", ApiClient.create);
// apiClientRouter.get("/", ApiClient.read);
// apiClientRouter.get("/:id", ApiClient.readById);
// apiClientRouter.patch("/:id", ApiClient.update);
// apiClientRouter.patch("/:id/permissions", ApiClient.addPermissions);
// apiClientRouter.delete("/:id/permissions", ApiClient.removePermission);
// apiClientRouter.patch("/:id/revoke", ApiClient.revoke);
// apiClientRouter.delete("/:id", ApiClient.remove);

export default apiClientRouter;