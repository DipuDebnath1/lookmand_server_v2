import express from 'express';
import auth from '../../../middleware/auth';
import Roles from '../../const/Roles';
import dashboardController from './dashboard.controller';

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
