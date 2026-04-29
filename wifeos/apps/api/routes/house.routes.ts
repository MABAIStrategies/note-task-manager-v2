import { Router } from "express";
import { getHouseOverview } from "../services/houseService";

export const houseRouter = Router();

houseRouter.get("/tasks", (_request, response) => {
  response.json(getHouseOverview());
});
