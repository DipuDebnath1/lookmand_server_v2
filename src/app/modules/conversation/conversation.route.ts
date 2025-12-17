import express from 'express';
import auth from '../../../middleware/auth';
import Roles from '../../const/Roles';
import conversationController from './conversation.controller';
import validationRequest from '../../utils/validationRequest';
import { SendMessageInConversationValidation } from './conversation.validation';
import fileUploader from '../../../middleware/fileUpload/fileUploader';
const UPLOADS_FOLDER = 'conversations';
const fileUpload = fileUploader(UPLOADS_FOLDER);
const router = express.Router();

router.post(
  '/create',
  auth(Roles.COMMON),
  conversationController.CreateConversation,
);

router.get(
  '/all',
  auth(Roles.COMMON),
  conversationController.GetAllConversations,
);

router.post(
  '/:conversationId/message',
  auth(Roles.COMMON),
  fileUpload.single('image'),
  validationRequest(SendMessageInConversationValidation),
  conversationController.SendMessageInConversation,
);

router.get(
  '/:conversationId/single',
  auth(Roles.COMMON),
  conversationController.GetSingleConversation,
);

export default router;
