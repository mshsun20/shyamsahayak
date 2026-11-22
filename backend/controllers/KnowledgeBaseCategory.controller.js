import KnowledgeBaseCategory from "../models/knowledgeBaseCategory.model.js";
import KnowledgeBase from "../models/knowledgeBase.model.js";
import { queueKnowledgeBaseReindex } from "../services/knowledgeBaseAI/ingestion.service.js";

const makeCode = (name) => String(name).trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 40) || "GENERAL";

// Default stays "Active" only (mobile app). The admin panel passes ?status=all (or Active / Inactive).
const list = async (req, res) => {
  try {
    const wanted = String(req.query?.status || "Active");
    const filter = wanted.toLowerCase() === "all" ? {} : { status: wanted === "Inactive" ? "Inactive" : "Active" };
    const data = await KnowledgeBaseCategory.find(filter).sort({ createdAt: 1 }).lean();
    res.status(200).json({ success: true, data });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const create = async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    if (!name) return res.status(400).json({ success: false, message: "Category name is required" });
    const userId = req.user?._id || null;
    // Only accept known fields so an empty/blank `code` can never override the generated one.
    const { description, icon, bg, iconBg, arrow, border, status } = req.body || {};
    const category = await KnowledgeBaseCategory.create({
      code: makeCode(name),
      name, description, icon, bg, iconBg, arrow, border, status,
      createdBy: userId, updatedBy: userId,
    });
    res.status(201).json({ success: true, data: category });
  } catch (error) { res.status(400).json({ success: false, message: error.code === 11000 ? "Category name or code already exists" : error.message }); }
};

const update = async (req, res) => {
  try {
    const existing = await KnowledgeBaseCategory.findById(req.params.id).select("name").lean();
    if (!existing) return res.status(404).json({ success: false, message: "Category not found" });
    const payload = { ...req.body, updatedBy: req.user?._id || null };
    delete payload._id;
    if (payload.name) payload.name = String(payload.name).trim();
    if (payload.code) payload.code = String(payload.code).trim().toUpperCase();
    const category = await KnowledgeBaseCategory.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });

    // Articles reference the category by _id, so a rename needs no article update.
    // The AI search index keeps the category name in its payload, so refresh it for AI-enabled articles.
    if (category.name !== existing.name) {
      const affected = await KnowledgeBase.find({ category: category._id, aiEnabled: true }).select("_id").lean();
      for (const kb of affected) {
        try { await queueKnowledgeBaseReindex(kb._id); }
        catch (error) { console.error("[KB] Reindex after category rename failed:", error.message); }
      }
    }
    res.status(200).json({ success: true, data: category });
  } catch (error) { res.status(400).json({ success: false, message: error.code === 11000 ? "Category name or code already exists" : error.message }); }
};

const remove = async (req, res) => {
  try {
    const category = await KnowledgeBaseCategory.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });
    const usage = await KnowledgeBase.countDocuments({ category: category._id });
    if (usage) {
      category.status = "Inactive";
      category.updatedBy = req.user?._id || null;
      await category.save();
      return res.status(200).json({ success: true, message: "Category deactivated because Knowledge Base records still use it" });
    }
    await category.deleteOne();
    res.status(200).json({ success: true, message: "Category deleted" });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

export default { list, create, update, remove };
