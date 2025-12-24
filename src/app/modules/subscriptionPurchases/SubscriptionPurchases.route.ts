import express from 'express';
import auth from '../../../middleware/auth';
import SubscriptionPurchasesController from './SubscriptionPurchases.controller';
import { Roles } from '../user/const';
const router = express.Router();

router.post(
  '/:subscriptionId/direct',
  auth(Roles.PROVIDER),
  SubscriptionPurchasesController.SubscriptionPurchasesWithoutPayment,
);
router.post(
  '/:subscriptionId/webhook',
  SubscriptionPurchasesController.SubscriptionPurchasesWithPayment,
);

router.get(
  '/current-plan',
  auth(Roles.PROVIDER),
  SubscriptionPurchasesController.ProviderSubscriptionCurrentPlan,
);

export default router;
