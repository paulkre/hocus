import chalk from "chalk";

type Value = string | number;

export const session = (value: Value) => chalk.hex("#DD6B20").bold(value);
export const project = (value: Value) => chalk.hex("#D53F8C").bold(value);
export const time = (value: Value) => chalk.hex("#38A169").bold(value);
export const date = (value: Value) => chalk.bold(value);
export const id = (value: Value) => chalk.grey.bold(value);
export const error = (value: Value) => chalk.hex("#E53E3E")(value);
export const bold = (value: Value) => chalk.bold(value);
export const tag = (value: Value) => chalk.hex("#3182CE").bold(value);
export const client = (value: Value) => chalk.hex("#D53F8C").bold(value);
