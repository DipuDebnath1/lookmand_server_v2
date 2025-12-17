import { z } from 'zod';

const createReportValidation = z.object({
  body: z
    .object({
      reportBy: z.string().optional(),
      title: z.string().min(3).max(100),
      description: z.string().min(10).max(500),
    })
    .strict(),
});

export const ReportValidation = {
  createReportValidation,
};

export default ReportValidation;
