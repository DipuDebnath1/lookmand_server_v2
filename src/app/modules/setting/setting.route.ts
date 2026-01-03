import express from 'express';
import auth from '../../../middleware/auth';
import settingController from './setting.controller';
import validationRequest from '../../utils/validationRequest';
import { documentUpdateValidation } from './setting.validation';
import { Roles } from '../user/const';

const router = express.Router();

router.get('/:name', settingController.getContent);
router.put(
  '/:name',
  validationRequest(documentUpdateValidation),
  auth(Roles.COMMON_ADMIN),
  settingController.updateContent,
);

export default router;
