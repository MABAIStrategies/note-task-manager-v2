import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  response.status(500).json({
    error: "WifeOS mock API error",
    message: error instanceof Error ? error.message : "Unknown error"
  });
};
