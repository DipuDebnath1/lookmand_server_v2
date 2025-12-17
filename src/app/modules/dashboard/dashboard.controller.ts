import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import dashboardService from './dashboard.service';
import transactionService from '../transaction/transaction.service';

// Get dashboard statistics
const DashboardStatistics = catchAsync(async (req: Request, res: Response) => {
  const dashboardStatistics =
    await dashboardService.dashboardServiceStatistics();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    data: dashboardStatistics,
    success: true,
    message: 'Dashboard statistics fetched successfully',
  });
});

// Get monthly income data
const getMonthlyIncome = catchAsync(async (req: Request, res: Response) => {
  const monthlyIncome = await dashboardService.getMonthlyIncome();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    data: monthlyIncome,
    success: true,
    message: 'Monthly income data fetched successfully',
  });
});

// Get transactions

const getTransactions = catchAsync(async (req: Request, res: Response) => {
  const transactions = await transactionService.getTransactions(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    data: transactions,
    success: true,
    message: 'Transactions fetched successfully',
  });
});

// Exporting all controller functions as an objects
const dashboardController = {
  DashboardStatistics,
  getMonthlyIncome,
  getTransactions,
};

export default dashboardController;
