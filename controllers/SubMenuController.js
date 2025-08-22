const { default: mongoose } = require("mongoose");
const { SubCategory, Game } = require("../models/Game");





// Get all sub-categories
 const getAllSubCategory = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).send({ error: "Database not connected." });
    }

    const subCategories = await SubCategory.find();

    if (!subCategories || subCategories.length === 0) {
      return res.status(404).send({ error: "No sub-categories found." });
    }

    res.send({
      message: "Sub-categories fetched successfully.",
      subCategories,
    });
  } catch (error) {
    console.error("Error fetching sub-categories:", error);
    res.status(500).send({ error: "Failed to fetch sub-categories." });
  }
};

// Create a new sub-category
const createSubCategory =  async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).send({ error: "Database not connected." });
    }

    const { title, img, parentMenu } = req.body;

    if (!title) {
      return res.status(400).send({ error: "Title is required." });
    }

    const existingSubCategory = await SubCategory.findOne({ title });
    if (existingSubCategory) {
      return res.status(409).send({ error: "Sub-category with this title already exists." });
    }

    const newSubCategory = new SubCategory({
      title,
      img: img || "",
      parentMenu: parentMenu || "",
      createdAt: new Date(),
    });

    await newSubCategory.save();

    res.status(201).send({
      message: "Sub-category created successfully.",
      subCategory: {
        _id: newSubCategory._id,
        title: newSubCategory.title,
        img: newSubCategory.img,
        parentMenu: newSubCategory.parentMenu,
        createdAt: newSubCategory.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating sub-category:", error);
    res.status(500).send({ error: "Failed to create sub-category." });
  }
};

// Update a sub-category
const updateSubCategoryById =  async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).send({ error: "Database not connected." });
    }

    const { id } = req.params;
    const { title, img, parentMenu } = req.body;

    if (!title) {
      return res.status(400).send({ error: "Title is required." });
    }

    const existingSubCategory = await SubCategory.findOne({ title, _id: { $ne: id } });
    if (existingSubCategory) {
      return res.status(409).send({ error: "Sub-category with this title already exists." });
    }

    const updatedSubCategory = await SubCategory.findByIdAndUpdate(
      id,
      { title, img: img || "", parentMenu: parentMenu || "", updatedAt: new Date() },
      { new: true }
    );

    if (!updatedSubCategory) {
      return res.status(404).send({ error: "Sub-category not found." });
    }

    res.send({
      message: "Sub-category updated successfully.",
      subCategory: updatedSubCategory,
    });
  } catch (error) {
    console.error("Error updating sub-category:", error);
    res.status(500).send({ error: "Failed to update sub-category." });
  }
};

// Delete a sub-category
const deleteSubCategoryById =  async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).send({ error: "Database not connected." });
    }

    const { id } = req.params;

    const subCategory = await SubCategory.findById(id);
    if (!subCategory) {
      return res.status(404).send({ error: "Sub-category not found." });
    }

    // Delete all games linked to this sub-category
    const gameDeleteResult = await Game.deleteMany({ subCategory: id });

    // Delete the sub-category
    const subCategoryDeleteResult = await SubCategory.findByIdAndDelete(id);

    res.send({
      message: "Sub-category and related games deleted successfully.",
      deletedSubCategory: subCategoryDeleteResult,
      deletedGames: gameDeleteResult.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting sub-category:", error);
    res.status(500).send({ error: "Failed to delete sub-category and related games." });
  }
};


module.exports = { 
  getAllSubCategory,
  createSubCategory,
  updateSubCategoryById,
  deleteSubCategoryById
};