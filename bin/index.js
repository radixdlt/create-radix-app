#!/usr/bin/env node

/**
 * This script is used to create a new Radix dApp project by cloning a template.
 * It prompts the user to enter a project name and select a template, then uses degit to clone the selected template.
 * After cloning, it installs the necessary dependencies and provides instructions on how to start the app.
 */

// Import dependencies
import inquirer from "inquirer";
import degit from "degit";
import ora from "ora";
import { exec } from "child_process";

// Get the template path
const basePath = "radixdlt/";

// Template options
/**
 * Array of templates available for selection.
 * @type {Array<{name: string, value: string, clientDir: string}>}
 */
const templates = [
  {
    name: "Vanilla - JS",
    value: "official-examples/getting-started/vanilla-js-dapp",
    clientDir: "root-dir",
  },
  {
    name: "React - JS",
    value: "official-examples/getting-started/react-js-dapp",
    clientDir: "root-dir",
  },
  {
    name: "React - TS",
    value: "official-examples/getting-started/react-ts-dapp",
    clientDir: "root-dir",
  },
  {
    name: "Svelte - JS",
    value: "official-examples/getting-started/svelte-js-dapp",
    clientDir: "root-dir",
  },
  {
    name: "Svelte - TS",
    value: "official-examples/getting-started/svelte-ts-dapp",
    clientDir: "root-dir",
  },
  {
    name: "Fullstack Gumball Machine - JS",
    value: "official-examples/step-by-step/10-gumball-machine-front-end",
    clientDir: "client-dir",
  },
  {
    name: "Fullstack Radiswap JS",
    value: "official-examples/step-by-step/21-radiswap-dapp",
    clientDir: "client-dir",
  },
  // Add more templates here
];

// Ask the user to enter a project name and select a template. The project name is used as the folder name for the new project.
inquirer
  .prompt([
    {
      type: "input",
      name: "projectName",
      message: "What is the name of your project?",
      validate: function (value) {
        if (value.length) {
          return true;
        } else {
          return "Please enter a valid project name.";
        }
      },
    },
    {
      type: "list",
      name: "template",
      message: "Which template would you like to use?",
      choices: templates,
      filter: function (value) {
        // Find the selected template
        const template = templates.find((t) => t.value === value);

        // Return an object that includes the template value and the clientDir
        return {
          value: template.value,
          clientDir: template.clientDir,
        };
      },
    },
  ])
  .then((answers) => {
    // Use degit to clone the selected template
    /**
     * The emitter object used for cloning the template.
     * @type {degit.Emitter}
     */

    const templatePath = `${basePath}${answers.template.value}`;
    // console.log("answers", answers);
    const emitter = degit(templatePath, {
      cache: false,
      force: true,
      verbose: true,
    });
    // emitter.on("info", (info) => {
    //   console.log(info.message);
    // });
    const cloneSpinner = ora().start(`Cloning template ${templatePath}...`);
    const installSpinner = ora();
    emitter
      .clone(answers.projectName)
      .then(() => {
        // Green success message
        cloneSpinner.succeed("\x1b[32mTemplate created successfully.\x1b[0m");
      })
      .catch((err) => {
        cloneSpinner.fail(`Failed to clone template:  ${err.message}`);
      })
      .then(() => {
        installSpinner.start("Installing dependencies...");
        if (answers.template.clientDir === "root-dir") {
          exec(
            `cd ${answers.projectName} && npm install --loglevel=error`,
            postInstallCommands(answers, installSpinner)
          );
        }
        if (answers.template.clientDir === "client-dir") {
          exec(
            `cd ${answers.projectName}/client && npm install --loglevel=error`,
            postInstallCommands(answers, installSpinner)
          );
        }
      });
  });

const postInstallCommands =
  (answers, installSpinner) => (error, _stdout, stderr) => {
    if (error) {
      installSpinner.fail(`Error installing dependencies: ${error.message}`);
      return;
    }
    if (stderr) {
      installSpinner.fail(`Error installing dependencies: ${stderr}`);
      return;
    }
    // Green success message
    installSpinner.succeed(
      "\x1b[32mDependencies installed successfully.\x1b[0m"
    );
    console.log(
      // Yellow instruction message
      `\nTo start the app run: \x1b[33mcd ${answers.projectName} && npm run dev\x1b[0m`
    );
  };
