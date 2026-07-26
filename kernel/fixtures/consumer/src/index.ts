import {
  createTenantId,
  generateId,
  getClock,
  loadConfig,
  buildLogFields,
} from "@dyogas/kernel";

export function smoke(): string {
  const tid = createTenantId("fixture-tenant");
  const id = generateId();
  const t = getClock().nowIso();
  const cfg = loadConfig({ DYOGAS_ENV: "test" });
  const fields = buildLogFields({ correlationId: id });
  return `${tid}:${id}:${t}:${cfg.getString("DYOGAS_ENV")}:${fields.module}`;
}
