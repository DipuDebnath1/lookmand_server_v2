import express from 'express';
import auth from '../../../middleware/auth';
import SubscriptionController from './subscription.controller';
import validationRequest from '../../utils/validationRequest';
import {
  subscriptionCreateValidation,
  subscriptionUpdateValidation,
} from './subscription.validation';

const router = express.Router();

router.post(
  '/',
  validationRequest(subscriptionCreateValidation),
  auth('commonAdmin'),
  SubscriptionController.CreateSubscription,
);

router.get('/', SubscriptionController.GetAllSubscriptions);

router.get('/:id', SubscriptionController.GetSingleSubscription);

router.put(
  '/:id',
  validationRequest(subscriptionUpdateValidation),
  auth('commonAdmin'),
  SubscriptionController.UpdateSubscription,
);

router.delete(
  '/:id',
  auth('commonAdmin'),
  SubscriptionController.DeleteSubscription,
);

export default router;
