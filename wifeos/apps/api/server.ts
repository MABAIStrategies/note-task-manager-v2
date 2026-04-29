import cors from "cors";
import express from "express";
import { babyRouter } from "./routes/baby.routes";
import { createRouter } from "./routes/create.routes";
import { houseRouter } from "./routes/house.routes";
import { rabbitRouter } from "./routes/rabbit.routes";
import { ringRouter } from "./routes/ring.routes";
import { settingsRouter } from "./routes/settings.routes";
import { watchRouter } from "./routes/watch.routes";
import { mockAuth } from "./middleware/auth";
import { errorHandler } from "./middleware/errorHandler";
import { privacyGuard } from "./middleware/privacyGuard";
import { getTodayBriefing, getWeeklyBrief } from "./services/briefingService";

const app = express();
const port = Number(process.env.PORT ?? 4174);

app.use(cors());
app.use(express.json());
app.use(mockAuth);
app.use(privacyGuard);

app.get("/api/today", (_request, response) => {
  response.json(getTodayBriefing());
});

app.get("/api/weekly-brief", (_request, response) => {
  response.json(getWeeklyBrief());
});

app.use("/api/baby", babyRouter);
app.use("/api/house", houseRouter);
app.use("/api/create", createRouter);
app.use("/api/rabbit", rabbitRouter);
app.use("/api/watch", watchRouter);
app.use("/api/ring", ringRouter);
app.use("/api/settings", settingsRouter);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`WifeOS mock API listening on http://localhost:${port}`);
});
