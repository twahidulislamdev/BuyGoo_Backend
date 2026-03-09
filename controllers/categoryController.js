const categorySchema = require("../model/categorySchema");

// utility to normalise slug values
const generateSlug = (text) =>
  text.toString().trim().toLowerCase().replace(/\s+/g, "-");

// =========== Create Category start Here ==============
const createCategory = async (req, res) => {
  try {
    const { name, description, slug, status } = req.body;
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "Name and description are required.",
      });
    }

    const existingCategory = await categorySchema.findOne({ name });
    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: "Category with this name already exists",
      });
    }
    //
    const createcategory = new categorySchema({
      name,
      description,
      slug: slug ? generateSlug(slug) : generateSlug(name),
      status: status || "active",
    });

    await createcategory.save();
    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category: createcategory,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating category",
      error: error.message,
    });
  }
};
// ============ Create Category End Here ==============

// =========== Get All Categories Start Here =============
const getAllCategory = async (req, res) => {
  // ← added async (good practice)
  try {
    const allCategoryList = await categorySchema.find({});
    res.status(200).json({
      success: true,
      message: "All categories retrieved successfully",
      categories: allCategoryList, // more conventional plural name
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error Fetching Categories",
      error: error.message,
    });
  }
};
// ========== Get All Categories End Here ===========

// =========== Update Category start Here ===========
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    // accept slug and status in the body as well
    const { name, description, slug, status } = req.body;

    // require at least one field to update
    if (!name && !description && !slug && !status) {
      return res.status(400).json({
        success: false,
        message:
          "At least one field (name, description, slug or status) is required to update",
      });
    }

    const category = await categorySchema.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // update provided fields
    if (name) {
      category.name = name;
      // regenerate slug if caller didn't provide one explicitly
      if (!slug) {
        category.slug = generateSlug(name);
      }
    }
    if (description) category.description = description;
    if (slug) category.slug = generateSlug(slug);
    if (status) category.status = status;
    await category.save();

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating category",
      error: error.message,
    });
  }
};
// ========== Update Category End Here ===========

// =========== Delete Category Start Here ===========
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCategory = await categorySchema.findByIdAndDelete(id);
    if (!deletedCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      category: deletedCategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting category",
      error: error.message,
    });
  }
};
// ========== Delete Category End Here ===========

// =========== Delete All Categories start Here ===========
const deleteAllCategory = async (req, res) => {
  try {
    const result = await categorySchema.deleteMany({});
    res.status(200).json({
      success: true,
      message: "All categories deleted successfully",
      deletedCount: result.deletedCount, // more informative
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting categories",
      error: error.message,
    });
  }
};
// ========== Delete All Categories End Here ===========

module.exports = {
  createCategory,
  getAllCategory,
  updateCategory,
  deleteCategory,
  deleteAllCategory,
};
