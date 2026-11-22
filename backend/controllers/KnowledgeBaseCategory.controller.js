import KnowledgeBaseCategory from "../models/knowledgeBaseCategory.model.js";
import KnowledgeBase from "../models/knowledgeBase.model.js";

const makeCode = (name) => String(name).trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 40) || "GENERAL";

// Default stays "Active" only (mobile app). The admin panel passes ?status=all (or Active / Inactive).
const list = async (req, res) => {
  try {
    const wanted = String(req.query?.status || "Active");
    const filter = wanted.toLowerCase() === "all" ? {} : { status: wanted === "Inactive" ? "Inactive" : "Active" };
    const data = await KnowledgeBaseCategory.find(filter).sort({ name: 1 }).lean();
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
