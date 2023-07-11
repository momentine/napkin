// Determine if it is in development mode
let WEB_URL = process.env.WEB_URL;
export const baseUrl = WEB_URL ?? `file://${__dirname}/index.html`;

