import { generateCreativeOutput } from "../lib/contentTemplates";
import type { CreativeOutput } from "../lib/types";

export function generateMomContent(input: string): CreativeOutput {
  return generateCreativeOutput(input);
}

export function saveCreativeOutput(output: CreativeOutput): CreativeOutput & { saved: true; savedAt: string } {
  return {
    ...output,
    saved: true,
    savedAt: new Date().toISOString()
  };
}

// Future AI/API note: route prompt creation here so OpenAI, Gemini, OpenRouter,
// or image generation/editing providers can be swapped without touching the UI.
