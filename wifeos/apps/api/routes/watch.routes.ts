import { Router } from "express";
import { getCaseBoard } from "../../web/src/agents/caseBoardAgent";

export const watchRouter = Router();

watchRouter.get("/caseboard", (_request, response) => {
  response.json(getCaseBoard());
});
