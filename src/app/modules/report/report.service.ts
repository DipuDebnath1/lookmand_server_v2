/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../ErrorHandler/AppError';
import Report from './report.model';
import { IReport } from './report.type';
import { ReportBaseService } from '../../../service';

// Create a new report
const createReport = async (payload: IReport) => {
  const res = await Report.create(payload);
  if (!res)
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create report');
  return res;
};

// resolve a report
const resolveReport = async (reportId: string) => {
  const report = await Report.findById(reportId);
  if (!report) throw new AppError(httpStatus.NOT_FOUND, 'Report not found');
  report.status = 'resolve';
  await report.save();
  return report;
};

// get all reports
const getAllReports = async (query: any) => {
  const select = 'author reportTo title description status createdAt updatedAt';
  const populate = [
    { path: 'author', select: 'name email image phone' },
    { path: 'reportTo', select: 'name email image phone' },
  ];

  const filters = query.status ? { status: query.status } : {};

  const res = await ReportBaseService.findWithPagination({
    filters,
    select,
    populate,
    ...query,
    sort: { createdAt: -1, status: 1 },
  });
  if (!res) throw new AppError(httpStatus.NOT_FOUND, 'No reports found');
  return res;
};

// get a single report
const getSingleReport = async (reportId: string) => {
  const select = 'author reportBy title description createdAt updatedAt';
  const populate = [
    { path: 'author', select: 'name email image phone' },

    { path: 'reportTo', select: 'name email image phone' },
  ];

  const res = await Report.findById(reportId).populate(populate).select(select);
  if (!res) throw new AppError(httpStatus.NOT_FOUND, 'Report not found');
  return res;
};

// Exporting the service functions
export const ReportService = {
  createReport,
  resolveReport,
  getAllReports,
  getSingleReport,
};

export default ReportService;
