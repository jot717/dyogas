/**
 * @deprecated Use startDecisionProductServer from decision-server.ts
 * Kept for import path compatibility.
 */
export {
  startDecisionProductServer as startApprovalServer,
  startDecisionProductServer,
  type DecisionWebServer as WebUiServer,
} from "./decision-server.js";
