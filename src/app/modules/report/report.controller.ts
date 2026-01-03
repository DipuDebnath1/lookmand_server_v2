/* eslint-disable @typescript-eslint/no-explicit-any */
import catchAsync from '../../utils/catchAsync';
import ReportService from './report.service';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import AppError from '../../ErrorHandler/AppError';
import { Types } from 'mongoose';
import { IReport } from './report.type';
import sendResponse from '../../utils/sendResponse';
const ObjectId = Types.ObjectId;

// Create a new report
const CreateReport = catchAsync(async (req: Request, res: Response) => {
  const { user }: any = req;
  const userId = user?._id;
  const payload: IReport = req.body;

  payload.author = userId;

  if (!ObjectId.isValid(payload.reportTo))
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid reportTo ID');

  if (payload.author.toString() === payload.reportTo.toString())
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'provide valid reportTo id different than author id',
    );

  const report = await ReportService.createReport(payload);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Report created successfully',
    data: report,
  });
});

// resolve a report
const ResolveReport = catchAsync(async (req: Request, res: Response) => {
  const { reportId } = req.params;

  if (!ObjectId.isValid(reportId))
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid report ID');

  const report = await ReportService.resolveReport(reportId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Report resolved successfully',
    data: report,
  });
});

// get all reports
const GetAllReports = catchAsync(async (req: Request, res: Response) => {
  const reports = await ReportService.getAllReports(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reports retrieved successfully',
    data: reports,
  });
});

// get single report
const GetSingleReport = catchAsync(async (req: Request, res: Response) => {
  const { reportId } = req.params;
  if (!ObjectId.isValid(reportId))
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid report ID');
  const report = await ReportService.getSingleReport(reportId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Report retrieved successfully',
    data: report,
  });
});

// Exporting the controller functions
export const ReportController = {
  CreateReport,
  ResolveReport,
  GetSingleReport,
  GetAllReports,
};

export default ReportController;
