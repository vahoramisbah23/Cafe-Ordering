import Category from '../models/Category.js';

// @desc    Get all categories
// @route   GET /api/categories
export const getCategories = async (req, res) => {
  try {
    const cats = await Category.find().sort({ createdAt: 1 });
    res.json({ success: true, data: cats });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// @desc    Create a new category
// @route   POST /api/categories
export const createCategory = async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ success: false, message: 'Category name is required' });
  }
  try {
    const cat = await Category.create({ name: name.trim() });
    res.status(201).json({ success: true, data: cat });
  } catch (e) {
    if (e.code === 11000) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }
    res.status(500).json({ success: false, message: e.message });
  }
};

// @desc    Delete a category by ID
// @route   DELETE /api/categories/:id
export const deleteCategory = async (req, res) => {
  try {
    const cat = await Category.findByIdAndDelete(req.params.id);
    if (!cat) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, message: 'Category deleted' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};
