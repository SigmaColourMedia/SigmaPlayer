import * as fs from "node:fs";
import path from "node:path";

type BuildManifest = {
  "home.js": string;
};

const MANIFEST_PATH = path.join(process.env.BUILD_DIR, "manifest.json");
export function readBuildManifest(): BuildManifest {
  let raw_file = fs.readFileSync(MANIFEST_PATH).toString();

  return JSON.parse(raw_file) as BuildManifest;
}
