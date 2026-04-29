import { Router } from "express";
import { analyzeTopic } from "../services/rabbitHoleService";

export const rabbitRouter = Router();

rabbitRouter.post("/analyze", (request, response) => {
  const { topic = "Kardashian media cycles" } = request.body as { topic?: string };
  response.json(analyzeTopic(topic));
});
