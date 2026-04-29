import type { CreativeOutput } from "./types";

export function generateCreativeOutput(input: string): CreativeOutput {
  const moment = input.trim() || "Baby turned the living room into a tiny situation.";

  return {
    hook: `Nobody warned me "${moment}" was going to be today's whole personality.`,
    caption: "Management reviewed dinner service and filed a dramatic complaint.",
    babyBookEntry: `Today she discovered cause, effect, and the thrill of keeping everyone humble. ${moment}`,
    monetizationIdeas: [
      "Turn it into a three-part mom-life TikTok series.",
      "Save the line as a caption template for messy meal posts.",
      "Bundle similar moments into a digital baby memory printable."
    ]
  };
}
