import { Router } from "express";
import { generateCreative } from "../services/creativeService";

export const createRouter = Router();

createRouter.post("/generate", (request, response) => {
  const { input = "" } = request.body as { input?: string };
  response.json(generateCreative(input));
});
