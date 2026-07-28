import { Request } from 'express';

export type AuthUser = {
  phone: string;
  firstName?: string;
  lastName?: string;
  testMode?: boolean;
  exp: number;
};

export type RequestWithAuthUser = Request & {
  user?: AuthUser;
};
