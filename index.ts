#!/usr/bin/env node

import minimist from "minimist";
import { prompt } from "enquirer";
import path from "path";
import fs from "fs";
import { green, cyan, stripColors } from "kolorist";

const cwd = process.cwd();

type Templates = { name: string; hint?: string }[];

const TEMPLATES: Templates = [
  {
    name: green("vue-webpack-js"),
    hint: "(Vue 3 + Webpack 5 + ESBuild Loader)",
  },
  {
    name: green("vue-ts"),
    hint: "(Vue 3 + Webpack 5 + TypeScript + ESBuild Loader)",
  },
  {
    name: cyan("react-webpack-js"),
    hint: "(React + Webpack 5 + ESBuild Loader)",
  },
  {
    name: cyan("react-webpack-ts"),
    hint: "(React + Webpack 5 + TypeScript + ESBuilder Loader)",
  },
];

const renameFiles = {
  _gitignore: ".gitignore",
};

async function init() {
  const argv = minimist(process.argv.slice(2));

  let targetDir = argv._[0];
  if (!targetDir) {
    const { name } = await prompt<{ name: string }>({
      type: "input",
      name: "name",
      message: `Project name:`,
      initial: "awesome-project",
    });
    targetDir = name;
  }

  const rootDir = path.join(cwd, targetDir);
  console.log(`\nScaffolding project in ${rootDir}...`);

  if (!fs.existsSync(rootDir)) {
    fs.mkdirSync(rootDir, { recursive: true });
  } else {
    const existing = fs.readdirSync(rootDir);
    if (existing.length) {
      const { yes } = await prompt<{ yes: boolean }>({
        type: "confirm",
        name: "yes",
        initial: "Y",
        message:
          `Target directory ${targetDir} is not empty.\n` +
          `Remove existing files and continue?`,
      });

      if (yes) {
        emptyDir(rootDir);
      } else {
        return;
      }
    }
  }

  // determine template
  let template = argv.t || argv.template;
  let message = "Select a template:";
  let isValidTemplate = false;

  // --template expects a value
  if (typeof template === "string") {
    const availableTemplates = TEMPLATES.map(getTemplateName);
    isValidTemplate = availableTemplates.includes(template);
    message = `${template} isn't a valid template. Please choose from below:`;
  }

  if (!template || !isValidTemplate) {
    const { t } = await prompt<{ t: string }>({
      type: "select",
      name: "t",
      message,
      choices: TEMPLATES,
    });
    template = stripColors(t);
  }

  const templateDir = path.join(__dirname, `templates/${template}`);

  const write = (file: string, content?: string) => {
    const targetPath =
      file in renameFiles
        ? path.join(rootDir, renameFiles[file as keyof typeof renameFiles])
        : path.join(rootDir, file);
    if (content) {
      fs.writeFileSync(targetPath, content);
    } else {
      copy(path.join(templateDir, file), targetPath);
    }
  };

  const files = fs.readdirSync(templateDir);
  for (const file of files.filter((f) => f !== "package.json")) {
    write(file);
  }

  const pkg = require(path.join(templateDir, `package.json`));
  pkg.name = path.basename(rootDir);
  write("package.json", JSON.stringify(pkg, null, 2));

  let pkgManager = "npm";
  const npmExecpath = process.env.npm_execpath;
  if (npmExecpath) {
    pkgManager = /pnpm/.test(npmExecpath)
      ? "pnpm"
      : /yarn/.test(npmExecpath)
      ? "yarn"
      : pkgManager;
  }

  console.log(`\nDone. Now run:\n`);
  if (rootDir !== cwd) {
    console.log(`  cd ${path.relative(cwd, rootDir)}`);
  }
  console.log(`  ${pkgManager === "yarn" ? `yarn` : `${pkgManager} install`}`);
  console.log(
    `  ${pkgManager !== "npm" ? `${pkgManager} dev` : `npm run dev`}`
  );
  console.log();
}

function emptyDir(dir: string) {
  if (!fs.existsSync(dir)) {
    return;
  }
  for (const nest of fs.readdirSync(dir)) {
    const abs = path.resolve(dir, nest);
    // fs.rmSync: added in nodejs v14.14.0
    fs.rmSync(abs, { recursive: true });
  }
}

function getTemplateName({ name }: Templates[number]) {
  return stripColors(name);
}

function copy(src: string, dest: string) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    copyDir(src, dest);
  } else {
    fs.copyFileSync(src, dest);
  }
}

function copyDir(srcDir: string, destDir: string) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const file of fs.readdirSync(srcDir)) {
    const srcFile = path.resolve(srcDir, file);
    const destFile = path.resolve(destDir, file);
    copy(srcFile, destFile);
  }
}

init().catch((error) => console.error(error));
