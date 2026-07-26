/**
 * CLI entrypoint: `dev-orch <command>`.
 */
import { parseArgs } from "./args.js";
import { dispatchCli, defaultIo } from "./commands.js";

export async function main(
  argv: string[] = process.argv.slice(2),
): Promise<number> {
  const args = parseArgs(argv);
  const result = await dispatchCli(args, defaultIo);
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) {
    process.stderr.write(
      result.stderr + (result.stderr.endsWith("\n") ? "" : "\n"),
    );
  }
  return result.exitCode;
}

const entry = process.argv[1] ?? "";
const isDirect =
  entry.includes("cli/main") ||
  entry.includes("cli\\main") ||
  entry.endsWith("dev-orch") ||
  entry.endsWith("dev-orch.js");

if (isDirect) {
  main(process.argv.slice(2)).then((code) => {
    process.exitCode = code;
  });
}
