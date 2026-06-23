import express from 'express';
import { uploadAdvertisement } from '../../middlewares/upload.js';
import {
  createAdvertisement,
  deleteAdvertisement,
  getAdvertisementById,
  getAdvertisements,
  incrementAdvertisementClicks,
  incrementAdvertisementViews,
  updateAdvertisement,
} from '../../controllers/admin/advertisementsController.js';

const router = express.Router();

router.get('/', getAdvertisements);
router.get('/:id', getAdvertisementById);
router.post('/', uploadAdvertisement.single('image'), createAdvertisement);
router.put('/:id', uploadAdvertisement.single('image'), updateAdvertisement);
router.delete('/:id', deleteAdvertisement);
router.post('/:id/increment-views', incrementAdvertisementViews);
router.post('/:id/increment-clicks', incrementAdvertisementClicks);

export default router;
