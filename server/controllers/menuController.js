import MenuItem from '../models/MenuItem.js';
import Category from '../models/Category.js';

// @desc    Get all menu items (with search, category filter, sorting)
// @route   GET /api/menu
export const getMenuItems = async (req, res) => {
  try {
    const { category, search, sortBy, order, available } = req.query;

    const query = {};

    // Filter by availability
    if (available !== undefined) {
      query.available = available === 'true';
    }

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Live search by name or description
    if (search && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { tags: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // Dynamic sorting
    let sortOptions = { createdAt: -1 };
    if (sortBy === 'price_asc') {
      sortOptions = { price: 1 };
    } else if (sortBy === 'price_desc') {
      sortOptions = { price: -1 };
    } else if (sortBy === 'rating') {
      sortOptions = { rating: -1 };
    } else if (sortBy === 'name_asc') {
      sortOptions = { name: 1 };
    } else if (sortBy === 'name_desc') {
      sortOptions = { name: -1 };
    }

    const items = await MenuItem.find(query).sort(sortOptions);

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve menu items',
      error: error.message,
    });
  }
};

// @desc    Get single menu item by ID
// @route   GET /api/menu/:id
export const getMenuItemById = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: `Menu item not found with id: ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve menu item',
      error: error.message,
    });
  }
};

// @desc    Create new menu item
// @route   POST /api/menu
export const createMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, image, available, rating, prepTime, tags, calories } = req.body;

    if (!name || !description || price === undefined || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, price, and category are required',
      });
    }

    const newItem = await MenuItem.create({
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      category,
      image: image || undefined,
      available: available !== undefined ? available : true,
      rating: rating ? Number(rating) : 4.8,
      prepTime: prepTime || '5-10 mins',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map((t) => t.trim()) : []),
      calories: calories ? Number(calories) : null,
    });

    res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      data: newItem,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create menu item',
      error: error.message,
    });
  }
};

// @desc    Update menu item
// @route   PUT /api/menu/:id
export const updateMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: `Menu item not found with id: ${req.params.id}`,
      });
    }

    // Process tags if provided as comma-separated string
    const updateData = { ...req.body };
    if (typeof updateData.tags === 'string') {
      updateData.tags = updateData.tags.split(',').map((t) => t.trim()).filter(Boolean);
    }
    if (updateData.price !== undefined) {
      updateData.price = Number(updateData.price);
    }
    if (updateData.rating !== undefined) {
      updateData.rating = Number(updateData.rating);
    }

    const updatedItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: 'Menu item updated successfully',
      data: updatedItem,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update menu item',
      error: error.message,
    });
  }
};

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
export const deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: `Menu item not found with id: ${req.params.id}`,
      });
    }

    await MenuItem.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Menu item deleted successfully',
      data: { id: req.params.id },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete menu item',
      error: error.message,
    });
  }
};

// @desc    Get all distinct categories (from Category collection)
// @route   GET /api/menu/categories
export const getCategories = async (req, res) => {
  try {
    const cats = await Category.find().sort({ createdAt: 1 });
    const names = cats.length
      ? cats.map((c) => c.name)
      : ['Coffee & Hot Drinks', 'Coolers & Refreshers', 'Quick Bites', 'Sandwiches & Burgers', 'Pasta & Maggi', 'Desserts'];
    res.status(200).json({ success: true, data: names });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch categories', error: error.message });
  }
};
