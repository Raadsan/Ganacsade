import express from 'express';
import {
  createSetting,
  deleteSetting,
  getSettingByKey,
  getSettings,
  updateSetting,
} from '../../controllers/admin/settingsController.js';

const router = express.Router();

router.get('/', getSettings);
router.get('/:key', getSettingByKey);
router.put('/:key', updateSetting);
router.post('/', createSetting);
router.delete('/:key', deleteSetting);

export default router;
