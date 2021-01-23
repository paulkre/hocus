import chalk from "chalk";

export const project = (value: string) => chalk.magenta.bold(value);
export const time = (value: string) => chalk.green.bold(value);
export const date = (value: string) => chalk.cyan.bold(value);
export const id = (value: string) => chalk.grey.bold(value);
export const error = (value: string) => chalk.red(value);
export const bold = (value: string) => chalk.bold(value);
export const tag = (value: string) => chalk.blue.bold(value);
