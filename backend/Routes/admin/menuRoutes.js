import express from 'express';
import {
  createMenu,
  createSubMenu,
  deleteMenu,
  deleteSubMenu,
  getMenus,
  getMyMenus,
  updateMenu,
  updateSubMenu,
} from '../../controllers/admin/menuController.js';

const router = express.Router();

router.get('/all', getMenus);
router.post('/', createMenu);
router.put('/:menuId', updateMenu);
router.delete('/:menuId', deleteMenu);

router.post('/submenus', createSubMenu);
router.put('/submenus/:subMenuId', updateSubMenu);
router.delete('/submenus/:subMenuId', deleteSubMenu);

export default router;
