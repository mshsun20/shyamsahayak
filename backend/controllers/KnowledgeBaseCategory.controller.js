import KnowledgeBaseCategory from "../models/knowledgeBaseCategory.model.js";
import KnowledgeBase from "../models/knowledgeBase.model.js";

const makeCode = (name) => String(name).trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 40) || "GENERAL";

const list = async (_req, res) => {
  try {
    const data = await KnowledgeBaseCategory.find({ status: "Active" }).sort({ name: 1 }).lean();
    res.status(200).json({ success: true, data });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const create = async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    if (!name) return res.status(400).json({ success: false, message: "Category name is required" });
    const userId = req.user?._id || null;
    const category = await KnowledgeBaseCategory.create({
      name, code: String(req.body.code || makeCode(name)).trim().toUpperCase(),
      description: req.body.description || "", status: req.body.status || "Active",
      createdBy: userId, updatedBy: userId,
    });
    res.status(201).json({ success: true, data: category });
  } catch (error) { res.status(400).json({ success: false, message: error.code === 11000 ? "Category name or code already exists" : error.message }); }
};

const update = async (req, res) => {
  try {
    const payload = { ...req.body, updatedBy: req.user?._id || null };
    delete payload._id;
    if (payload.name) payload.name = String(payload.name).trim();
    if (payload.code) payload.code = String(payload.code).trim().toUpperCase();
    const category = await KnowledgeBaseCategory.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });
    res.status(200).json({ success: true, data: category });
  } catch (error) { res.status(400).json({ success: false, message: error.code === 11000 ? "Category name or code already exists" : error.message }); }
};

const remove = async (req, res) => {
  try {
    const category = await KnowledgeBaseCategory.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });
    const usage = await KnowledgeBase.countDocuments({ category: category.name });
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
