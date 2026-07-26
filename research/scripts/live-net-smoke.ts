import { clear, createTenantId, createTenancyContext, propagate } from "@dyogas/kernel";
import {
  createLiveStage1SourceCollector,
  execute,
  LIVE_STAGE1_ADAPTER_ID,
} from "../src/index.js";

clear();
propagate(createTenancyContext(createTenantId("t-net")));
const collector = createLiveStage1SourceCollector();
const out = await execute({
  brief_id: "brief-net",
  brief: {
    question: "typescript",
    allowedSourceClasses: ["web"],
    maxItems: 1,
  },
  collector,
});
console.log(
  JSON.stringify(
    {
      adapter: out.runEvidence.collectorAdapterId,
      live: out.runEvidence.collectorAdapterId === LIVE_STAGE1_ADAPTER_ID,
      n: out.evidence.length,
      pointer: out.evidence[0]?.metadata.pointer ?? null,
      trust: out.evidence[0]?.metadata.trust ?? null,
    },
    null,
    2,
  ),
);
