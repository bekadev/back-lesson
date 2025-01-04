import rateLimit from "express-rate-limit";
import { HttpStatuses } from "../../../common/types/httpStatuses";

export const loginLimiter = rateLimit({
  windowMs: 10 * 1000,
  limit: 5,
  message: "Too many login attempts, please try again after 10 seconds",
  statusCode: HttpStatuses.TooManyRequests,
});

export const registrationLimiter = rateLimit({
  windowMs: 10 * 1000,
  limit: 5,
  message: "Too many login attempts, please try again after 10 seconds",
  statusCode: HttpStatuses.TooManyRequests,
});

export const emailLimiter = rateLimit({
  windowMs: 10 * 1000,
  limit: 5,
  message: "Too many login attempts, please try again after 10 seconds",
  statusCode: HttpStatuses.TooManyRequests,
});
