import type { RequestHandler } from "express";

export const mockAuth: RequestHandler = (request, _response, next) => {
  request.headers["x-wifeos-user"] = request.headers["x-wifeos-user"] ?? "demo-user";
  next();
};
