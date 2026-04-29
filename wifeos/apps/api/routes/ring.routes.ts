import { Router } from "express";
import { getRingSummary } from "../services/ringService";

export const ringRouter = Router();

ringRouter.get("/events", (_request, response) => {
  response.json(getRingSummary());
});
