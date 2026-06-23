import express from 'express';
import { authorize } from '../../middlewares/auth.js';
import {
  createStaff,
  deleteStaff,
  getStaff,
  getStaffById,
  resetStaffPassword,
  updateStaff,
} from '../../controllers/admin/staffController.js';

const router = express.Router();
const adminOnly = authorize('admin');

router.get('/', adminOnly, getStaff);
router.post('/', adminOnly, createStaff);
router.get('/:id', adminOnly, getStaffById);
router.put('/:id', adminOnly, updateStaff);
router.patch('/:id/password', adminOnly, resetStaffPassword);
router.delete('/:id', adminOnly, deleteStaff);

export default router;
