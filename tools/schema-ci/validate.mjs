import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const schemasRoot = join(root, "schemas");

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (name.endsWith(".schema.json")) out.push(p);
  }
  return out;
}

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

const files = walk(schemasRoot);
const schemas = files.map((file) => ({
  file,
  schema: JSON.parse(readFileSync(file, "utf8")),
}));

for (const { schema } of schemas) {
  if (schema.$id) {
    ajv.addSchema(schema);
  }
}

let failed = 0;
for (const { file, schema } of schemas) {
  try {
    if (schema.$id) {
      const validate = ajv.getSchema(schema.$id);
      if (!validate) {
        ajv.compile(schema);
      }
    } else {
      ajv.compile(schema);
    }
    console.log("OK", file.slice(root.length + 1));
  } catch (err) {
    failed++;
    console.error("FAIL", file.slice(root.length + 1), err.message);
  }
}

if (failed > 0) {
  console.error(`Schema validation failed: ${failed}/${files.length}`);
  process.exit(1);
}
console.log(`Validated ${files.length} schemas`);
