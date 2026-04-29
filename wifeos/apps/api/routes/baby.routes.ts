import { Router } from "express";
import { createBabyEvent, listBabyEvents } from "../services/babyService";
import type { EventType } from "../../web/src/lib/types";

export const babyRouter = Router();

babyRouter.get("/events", (_request, response) => {
  response.json(listBabyEvents());
});

babyRouter.post("/events", (request, response) => {
  const { type = "milestone", notes = "Logged from mock API." } = request.body as { type?: EventType; notes?: string };
  response.status(201).json(createBabyEvent(type, notes));
});
