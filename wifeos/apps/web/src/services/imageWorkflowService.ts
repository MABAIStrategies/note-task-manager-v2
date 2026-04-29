export interface FutureImageWorkflow {
  modelPreference: string;
  enabled: false;
  capabilities: string[];
  note: string;
}

export function getFutureImageWorkflow(): FutureImageWorkflow {
  return {
    modelPreference: "Images 2 or latest high-fidelity image model when available",
    enabled: false,
    capabilities: ["daily moment image ideas", "memory book illustrations", "caption image edits", "moodboard generation"],
    note: "Reserved for a later multimodal release after consent, storage, and safety policies are implemented."
  };
}
