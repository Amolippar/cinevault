import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config';
import { UserPayload } from '../types';

export const signToken = (payload: UserPayload): string => {
  const options: SignOptions = {
    expiresIn: config.jwtExpiresIn as any,
  };
  return jwt.sign(payload, config.jwtSecret, options);
};

export const verifyToken = (token: string): UserPayload => {
  return jwt.verify(token, config.jwtSecret) as UserPayload;
};
