import type { RequestHandler } from "express";

export const privacyGuard: RequestHandler = (_request, response, next) => {
  response.setHeader("X-WifeOS-Privacy", "mock-summaries-only");
  next();
};
