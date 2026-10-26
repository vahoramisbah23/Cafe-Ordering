import express from 'express';
import {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getCategories,
} from '../controllers/menuController.js';

const router = express.Router();

router.get('/categories', getCategories);
router.route('/').get(getMenuItems).post(createMenuItem);
router.route('/:id').get(getMenuItemById).put(updateMenuItem).delete(deleteMenuItem);

export default router;
