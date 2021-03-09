import minimist from "minimist";
import path from "path";
import { inc, valid, ReleaseType } from "semver";
import execa from "execa";
import { prompt } from "enquirer";
import fs from "fs";
import { cyan, red, yellow, bold } from "kolorist";

const args = minimist(process.argv.slice(2));
const cwd = process.cwd();

const pkgPath = path.join(cwd, "package.json");

const pkg = require(pkgPath);
const pkgName = pkg.name;
const currentVersion = pkg.version;

const releaseTypes: ReleaseType[] = ["patch", "minor", "major"];
async function main() {
  let targetVersion = validateVersion(args._[0]);

  if (!targetVersion) {
    // no explicit version, offer suggestions
    const { release } = await prompt<{ release: string }>({
      type: "select",
      name: "release",
      message: "Select release type",
      choices: releaseTypes
        .map((type) => `${type} (${increaseVersion(type)})`)
        .concat(["custom"]),
    });

    if (release === "custom") {
      const { version } = await prompt<{ version: string }>({
        type: "input",
        name: "version",
        message: "Input custom version",
        initial: currentVersion,
      });
      targetVersion = version;
    } else {
      targetVersion = (release.match(/\((.*)\)/) as string[])[1]; // get version from release-type (version) using regex
    }
  }

  if (!validateVersion(targetVersion)) {
    return console.log(
      `${bold(red("Error:"))} Invalid target version: ${yellow(targetVersion)}`
    );
  }

  const tag = `v${targetVersion}`;

  const { yes } = await prompt<{ yes: boolean }>({
    type: "confirm",
    name: "yes",
    message: `Releasing ${tag}. Confirm?`,
  });

  if (!yes) {
    return;
  }

  stepLog("\nUpdating package version...");
  updateVersion(targetVersion);

  stepLog("\nGenerating changelog...");
  execa("pnpm", ["changelog"]);

  const { stdout } = await runCommand("git", ["diff"], { stdio: "pipe" });
}

function runCommand(
  bin: string,
  args: string[],
  opts: Record<string, string> = {}
) {
  return execa(bin, args, { stdio: "inherit", ...opts });
}

function increaseVersion(type: ReleaseType) {
  return inc(currentVersion, type);
}

function validateVersion(version: string) {
  return valid(version);
}

function stepLog(message: string) {
  console.log(cyan(message));
}

function updateVersion(version: string) {
  pkg.version = version;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
}

main().catch((error) => console.error(error));