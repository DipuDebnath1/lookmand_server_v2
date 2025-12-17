import express from 'express';
import auth from '../../../middleware/auth';
import SubscriptionPurchasesController from './SubscriptionPurchases.controller';
const router = express.Router();

router.post(
  '/:subscriptionId/basic',
  auth('provider'),
  SubscriptionPurchasesController.BasicSubscriptionPurchases,
);
router.post(
  '/:subscriptionId/premium',
  auth('provider'),
  SubscriptionPurchasesController.PaidSubscriptionPurchases,
);

router.get(
  '/current-plan',
  auth('provider'),
  SubscriptionPurchasesController.ProviderSubscriptionCurrentPlan,
);

export default router;
