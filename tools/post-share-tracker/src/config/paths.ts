import path from "node:path";
import { fileURLToPath } from "node:url";

export const projectRoot = fileURLToPath(new URL("../..", import.meta.url));
export const configPath = path.join(projectRoot, "config.yaml");
