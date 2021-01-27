import chalk from "chalk";

type Value = string | number;

export const session = (value: Value) => chalk.rgb(255, 165, 0).bold(value);
export const project = (value: Value) => chalk.magenta.bold(value);
export const time = (value: Value) => chalk.green.bold(value);
export const date = (value: Value) => chalk.cyan.bold(value);
export const id = (value: Value) => chalk.grey.bold(value);
export const error = (value: Value) => chalk.red(value);
export const bold = (value: Value) => chalk.bold(value);
export const tag = (value: Value) => chalk.blue.bold(value);
export const client = (value: Value) => chalk.bold(value);
