#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import * as inquirer from 'inquirer';
import chalk from 'chalk';
import * as template from "./utils/templates"

const SKIP_FILES = ['node_modules', '.template.json'];
function createDirectoryContents(templatePath: string, projectName: string) {
 const filesToCreate = fs.readdirSync(templatePath);
 filesToCreate.forEach(file => {
     const origFilePath = path.join(templatePath, file);
     const stats = fs.statSync(origFilePath);

     if (SKIP_FILES.indexOf(file) > -1) return;

     if (stats.isFile()) {
         let contents = fs.readFileSync(origFilePath, 'utf8');
         contents = template.render(contents, { projectName });
         const writePath = path.join(CURR_DIR, projectName, file);
         fs.writeFileSync(writePath, contents, 'utf8');
     } else if (stats.isDirectory()) {
         fs.mkdirSync(path.join(CURR_DIR, projectName, file));
         createDirectoryContents(path.join(templatePath, file), 
         path.join(projectName, file));
     }
 });
}

function createProject(projectPath: string) {
  if (fs.existsSync(projectPath)) {
    console.log(chalk.red(`Folder ${projectPath} exists. Delete or use another name.`));
    return false;
  }
  fs.mkdirSync(projectPath);

  return true;
}

const CHOICES = [
  "react",
  "next",
  "svelte",
  "vanilla"
];
const QUESTIONS = [
  {
    name: 'template',
    type: 'list',
    message: 'What project template would you like to use?',
    choices: CHOICES
  },
  {
    name: 'name',
    type: 'input',
    message: 'New project name?'
  }];

export interface CliOptions {
  projectName: string
  templateName: string
  templatePath: string
  tartgetPath: string
}
const CURR_DIR = process.cwd();
inquirer.prompt(QUESTIONS)
  .then(answers => {
    const projectChoice = answers['template'];
    const projectName = answers['name'];
    const templatePath = path.join(__dirname, 'templates', projectChoice);
    const tartgetPath = path.join(CURR_DIR, projectName);
    const options: CliOptions = {
      projectName,
      templateName: projectChoice,
      templatePath,
      tartgetPath
    }
    if (!createProject(tartgetPath)) {
      return;
    }
    createDirectoryContents(templatePath, projectName);
  });