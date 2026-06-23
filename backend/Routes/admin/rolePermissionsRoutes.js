import express from 'express';
import {
  getRolePermissions,
  upsertRolePermissions,
} from '../../controllers/admin/rolePermissionsController.js';

const router = express.Router();

router.get('/:id', getRolePermissions);
router.put('/:id', upsertRolePermissions);

export default router;
