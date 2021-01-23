declare module "time-ago" {
  export const ago: (date: Date) => string;
}

declare module "*.json" {
  const data: any;
  export default data;
}
