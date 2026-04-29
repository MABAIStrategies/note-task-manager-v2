import { getSupplyRunout, getTenMinuteReset } from "../../web/src/agents/houseFlowAgent";
import { houseTasks } from "../../web/src/lib/mockData";

export function getHouseOverview() {
  return {
    tasks: houseTasks,
    reset: getTenMinuteReset(),
    supplies: getSupplyRunout()
  };
}
