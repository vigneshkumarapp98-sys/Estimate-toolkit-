import Ajv from "ajv";
import schema from "../schema/estimate.schema.json";

const ajv = new Ajv({ allErrors: true });
const check = ajv.compile(schema);

// Returns readable error strings (empty list = valid).
export function validateEstimate(data) {
  if (check(data)) return [];
  return check.errors.map((e) => {
    const path = (e.instancePath ?? e.dataPath ?? "").replace(/^\./, "") || "(root)";
    return `${path}: ${e.message}`;
  });
}
