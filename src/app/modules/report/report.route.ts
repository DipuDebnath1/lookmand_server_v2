import express from 'express';
import ReportController from './report.controller';
import auth from '../../../middleware/auth';
import validationRequest from '../../utils/validationRequest';
import ReportValidation from './report.validation';
import { Roles } from '../user/const';
const router = express.Router();

router.post(
  '/',
  validationRequest(ReportValidation.createReportValidation),
  auth(Roles.USER_PROVIDER_COMMON),
  ReportController.CreateReport,
);
router.patch(
  '/:reportId/resolve',
  auth(Roles.COMMON_ADMIN),
  ReportController.ResolveReport,
);
router.get('/', auth(Roles.COMMON_ADMIN), ReportController.GetAllReports);
router.get(
  '/:reportId',
  auth(Roles.COMMON_ADMIN),
  ReportController.GetSingleReport,
);

export default router;
