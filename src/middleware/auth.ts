/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../app/ErrorHandler/AppError';
import { User } from '../app/modules/user/user.model';
import { accessTokenDecoded } from '../app/modules/tokens/tokenDecoded';
import { roleRights } from '../app/utils/roles';
import { NextFunction, Response } from 'express';

// Authorization middleware
const auth =
  (...requiredRights: string[]) =>
  async (req: any, res: Response, next: NextFunction) => {
    try {
      let token: string | undefined;

      // First, try to get the token from the Authorization header
      const authorization = req.headers.authorization;
      if (authorization && authorization.startsWith('Bearer ')) {
        token = authorization.split(' ')[1];
      }

      // If no token in the Authorization header, check cookies
      if (!token) {
        token = req.cookies.access_token;
      }

      if (!token) {
        return next(
          new AppError(httpStatus.UNAUTHORIZED, 'Unauthorized request!'),
        );
      }

      // Step 1: Verify token
      const decodedData: any = accessTokenDecoded(token);
      const userId = decodedData.sub; // User ID is typically in the "sub" field of JWT

      // Step 2: Find user from database using the userId (Assuming you have a UserModel)
      const user = await User.findById(userId);
      if (!user) {
        return next(new AppError(httpStatus.UNAUTHORIZED, 'User not found'));
      }

      // Step 3: Check if the user is deleted
      if (user.isDeleted) {
        return next(
          new AppError(httpStatus.UNAUTHORIZED, 'User account is deleted'),
        );
      }

      // Step 4: Get the user's roles from the `roles.ts` file
      const userRoles = roleRights.get(user.role!);
      // const userRoles = ['user', 'common'];
      if (!userRoles) {
        return next(
          new AppError(httpStatus.FORBIDDEN, 'User role does not exist'),
        );
      }

      // Step 5: Check if the user has required rights
      if (requiredRights.length) {
        const hasRequiredRights = requiredRights.every((requiredRight) =>
          userRoles.includes(requiredRight),
        );
        if (!hasRequiredRights && req.params.userId !== user.id) {
          return next(new AppError(httpStatus.FORBIDDEN, 'Forbidden Request'));
        }
      }

      // Attach the user to the request object
      req.user = user;

      // Continue to the next middleware
      next();
    } catch (error) {
      next(error);
    }
  };

export default auth;
