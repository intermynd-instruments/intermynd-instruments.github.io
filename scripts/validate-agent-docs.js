import { readFileSync } from "node:fs";

const agentGuide = readFileSync("AGENTS.md", "utf8");
const packageJson = JSON.parse(readFileSync("package.json", "utf8"));

const requiredSections = [
  "## Environment and setup",
  "## Essential commands",
  "## Project structure",
  "## Code and test conventions",
  "## Interactive QA",
  "## Development workflow",
];

const missingSections = requiredSections.filter((section) => !agentGuide.includes(section));
const documentedScripts = [...agentGuide.matchAll(/`npm run ([a-z][a-z:-]*)`/g)].flatMap((match) =>
  match[1] ? [match[1]] : [],
);
const missingScripts = documentedScripts.filter((script) => !packageJson.scripts?.[script]);

if (missingSections.length > 0 || missingScripts.length > 0) {
  if (missingSections.length > 0) {
    console.error(`AGENTS.md is missing sections: ${missingSections.join(", ")}`);
  }

  if (missingScripts.length > 0) {
    console.error(`AGENTS.md references missing npm scripts: ${missingScripts.join(", ")}`);
  }

  process.exitCode = 1;
} else {
  console.log(
    `AGENTS.md is complete and references ${documentedScripts.length} valid npm commands.`,
  );
}
