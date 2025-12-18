import express from 'express';
import auth from '../../../middleware/auth';
import dashboardController from './dashboard.controller';
import { Roles } from '../user/const';

const router = express.Router();

router.get(
  '/statistics',
  auth(Roles.COMMON_ADMIN),
  dashboardController.DashboardStatistics,
);

router.get(
  '/monthly_income',
  auth(Roles.COMMON_ADMIN),
  dashboardController.getMonthlyIncome,
);

router.get(
  '/transactions',
  auth(Roles.COMMON_ADMIN),
  dashboardController.getTransactions,
);

export default router;
