import express from 'express';
import reviewController from './review.controller';
import auth from '../../../middleware/auth';
import validationRequest from '../../utils/validationRequest';
import {
  createReviewValidation,
  updateReviewValidation,
} from './review.validation';
import { UserController } from '../user/user.controller';
import { Roles } from '../user/const';

const router = express.Router();

router.post(
  '/:bookingId',
  validationRequest(createReviewValidation),
  auth(Roles.USER),
  reviewController.CreateReview,
);
router.put(
  '/:id',
  validationRequest(updateReviewValidation),
  auth(Roles.USER),
  reviewController.UpdateReview,
);
router.delete('/:id', auth(Roles.USER), reviewController.DeleteReview);
router.get(
  '/all/:serviceId',
  auth(Roles.COMMON),
  reviewController.GetAllReviewsByServiceId,
);

router.get('/self', auth(Roles.PROVIDER), UserController.GetSelfReviews);

export default router;
