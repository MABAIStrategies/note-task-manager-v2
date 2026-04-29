import { Router } from "express";
import { getAlexaPlaceholder } from "../services/alexaService";
import { getFutureImageWorkflow } from "../../web/src/services/imageWorkflowService";

export const settingsRouter = Router();

settingsRouter.get("/", (_request, response) => {
  response.json({
    user: {
      name: "Demo Mom",
      notificationPreference: "helpful-only",
      voiceEnabled: false,
      privacyMode: true
    },
    babyProfile: {
      name: "Luna",
      birthDate: "2025-10-29",
      feedingType: "bottle",
      routineNotes: "Usually strongest nap after a bottle and quiet room."
    },
    integrations: {
      gmail: { connected: false, mode: "mock", summaryOnly: true },
      googleCalendar: { connected: false, mode: "mock", timezone: "America/New_York" },
      ring: { connected: false, mode: "mock" },
      alexa: getAlexaPlaceholder(),
      imageWorkflows: getFutureImageWorkflow()
    }
  });
});
