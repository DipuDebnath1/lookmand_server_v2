import express from 'express';
import auth from '../../../middleware/auth';
import favoriteServiceController from './favoriteService.controller';
import { Roles } from '../user/const';
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

router.get(
  '/ids',
  auth(Roles.USER),
  favoriteServiceController.FavoriteServiceId,
);

router.delete(
  '/:id',
  auth(Roles.USER),
  favoriteServiceController.removeFavoriteService,
);

export default router;
