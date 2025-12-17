/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt from 'jsonwebtoken';
import config from '../../../config';
import moment from 'moment';
import Token from './token.model';
import { tokenTypes } from './token.type';

interface ITokenPayload {
  sub: string; // userId
  iat: number;
  exp: number;
  type: string;
}

const generateToken = (
  userId: string,
  expires: number,
  type: string,
  secret: string = config.tokens.accessTokenSecret,
): string => {
  const payload: ITokenPayload = {
    sub: userId,
    iat: moment().unix(),
    exp: moment().add(expires, 'seconds').unix(),
    type,
  };

  return jwt.sign(payload, secret);
};

const saveToken = async (
  token: string,
  userId: string,
  expires: moment.Moment,
  type: string,
  blacklisted: boolean = false,
) => {
  const tokenDoc = await Token.create({
    token,
    user: userId,
    expires: expires.toDate(),
    type,
    blacklisted,
  });
  return tokenDoc;
};

const verifyToken = async (token: string, type: string): Promise<any> => {
  // Decode the token and get the payload
  const payload = jwt.verify(
    token,
    config.tokens.accessTokenSecret,
  ) as ITokenPayload;
  const tokenDoc = await Token.findOne({
    token,
    type,
    user: payload.sub, // 'sub' refers to the userId from the token payload
    blacklisted: false,
  });

  if (!tokenDoc) {
    throw new Error('Token not found');
  }
  return tokenDoc;
};

const generateAuthTokens = async (userId: string) => {
  const accessTokenExpires = moment().add(
    config.tokens.accessTokenExpires,
    'minutes',
  );
  const accessToken = generateToken(
    userId,
    accessTokenExpires.unix(),
    tokenTypes.access,
  );

  const refreshTokenExpires = moment().add(
    config.tokens.refreshTokenExpires,
    'days',
  );
  const refreshToken = generateToken(
    userId,
    refreshTokenExpires.unix(),
    tokenTypes.refresh,
  );

  // Save refresh token to the database
  await saveToken(
    refreshToken,
    userId,
    refreshTokenExpires,
    tokenTypes.refresh,
  );

  return {
    accessToken,
    refreshToken,
  };
};

const invalidateUserAuthToken = async (token: string) => {
  await Token.updateMany({ token }, { blacklisted: true });
};

// refresh user token
const refreshUserAuthToken = async (token: string) => {
  const tokenDoc = await Token.findOne({ token });
  if (!tokenDoc) throw new Error('Token not found');

  // Generate new tokens
  const { accessToken, refreshToken } = await generateAuthTokens(
    tokenDoc.user.toString(),
  );

  return {
    accessToken,
    refreshToken,
  };
};

export {
  generateToken,
  saveToken,
  verifyToken,
  generateAuthTokens,
  refreshUserAuthToken,
  invalidateUserAuthToken,
};
