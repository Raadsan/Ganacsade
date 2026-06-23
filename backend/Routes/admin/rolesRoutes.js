import express from 'express';
import {
  createRole,
  deleteRole,
  getRoleById,
  getRoles,
  updateRole,
  assignRoleToUser,
} from '../../controllers/admin/roleController.js';

const router = express.Router();

router.get('/', getRoles);
router.post('/', createRole);
router.put('/:id', updateRole);
router.delete('/:id', deleteRole);
router.put('/:id/assign-user', assignRoleToUser);
router.get('/:id', getRoleById);

export default router;
