import { Request } from "express";

export type AuthUser = {
  id: number;
  email: string;
  role?: "user" | "admin";
};

export type AuthenticatedRequest = Request & {
  auth?: AuthUser;
};

export type Address = {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
};
