import express from 'express';
import auth from '../../../middleware/auth';
import Roles from '../../const/Roles';
import favoriteServiceController from './favoriteService.controller';
const router = express.Router();

router.post(
  '/:id',
  auth(Roles.USER),
  favoriteServiceController.AddFFavoriteService,
);

router.get(
  '/',
  auth(Roles.USER),
  favoriteServiceController.getSelfFavoriteService,
);

router.delete(
  '/:id',
  auth(Roles.USER),
  favoriteServiceController.removeFavoriteService,
);

export default router;
