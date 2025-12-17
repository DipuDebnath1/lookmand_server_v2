import express from 'express';
import auth from '../../../middleware/auth';

import NotificationController from './notification.controller';

const { AllNotifications } = NotificationController;

const router = express.Router();

router.get('/', auth('common'), AllNotifications);

export default router;
