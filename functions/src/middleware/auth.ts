import type { Request, RequestHandler } from "express";
import { auth } from "../services/firebase";
import { ApiError } from "../utils/errors";

export interface AuthedRequest extends Request {
  user: {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
  };
}

export const requireAuth: RequestHandler = async (req, _res, next) => {
  try {
    const header = req.header("authorization");
    if (!header?.toLowerCase().startsWith("bearer ")) {
      throw new ApiError(401, "UNAUTHENTICATED", "Missing bearer token");
    }
    const token = header.slice(7).trim();
    const decoded = await auth().verifyIdToken(token);
    (req as AuthedRequest).user = {
      uid: decoded.uid,
      email: decoded.email ?? null,
      displayName: (decoded.name as string | undefined) ?? null,
      photoURL: (decoded.picture as string | undefined) ?? null,
    };
    next();
  } catch (err) {
    if (err instanceof ApiError) {
      next(err);
      return;
    }
    next(new ApiError(401, "UNAUTHENTICATED", "Invalid or expired token"));
  }
};
