import express from 'express';
import {
  createDeliveryPerson,
  deleteDeliveryPerson,
  getDeliveryPersonById,
  getDeliveryPersons,
  updateDeliveryPerson,
  uploadDeliveryUserPhoto,
  uploadDeliveryVehiclePhotos,
} from '../../controllers/admin/deliveryPersonsController.js';
import { uploadDelivery } from '../../middlewares/upload.js';

const router = express.Router();

router.get('/', getDeliveryPersons);
router.post('/upload/user-photo', uploadDelivery.single('image'), uploadDeliveryUserPhoto);
router.post('/upload/vehicle-photos', uploadDelivery.array('images', 8), uploadDeliveryVehiclePhotos);
router.post('/', createDeliveryPerson);
router.get('/:id', getDeliveryPersonById);
router.put('/:id', updateDeliveryPerson);
router.delete('/:id', deleteDeliveryPerson);

export default router;
