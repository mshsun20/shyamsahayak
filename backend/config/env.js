import dotenv from "dotenv";
dotenv.config({ quiet: true });

const requiredEnvVariables = [
    "NODE_ENV",
    "PORT_PRD",
    "PORT_QAS",
    "PORT_DEV",
    "APP_URL_PRD",
    "APP_URL_QAS",
    "APP_URL_DEV",
    "API_URL_PRD",
    "API_URL_QAS",
    "API_URL_DEV",
    "DB_NAME_PRD",
    "DB_NAME_QAS",
    "DB_NAME_DEV",
    "ONLN_DBURL_PRD",
    "ONLN_DBURL_QAS",
    "ONLN_DBURL_DEV",
    "ANTHROPIC_API_KEY",
    "CLAUDE_MODEL",
    "CLAUDE_MAX_TOKENS",
];

for (const envVar of requiredEnvVariables) {
    if (!process.env[envVar]) {
        console.error(`Error: Environment variable '${envVar}' is not set`);
        process.exit(1);
    }
}

const nodeEnv = process.env.NODE_ENV || "development";
const defaultPort = nodeEnv === "production"
? parseInt(process.env.PORT_PRD, 10)
: nodeEnv === "quality"
? parseInt(process.env.PORT_QAS, 10)
: parseInt(process.env.PORT_DEV, 10);

const appUrl = nodeEnv === "production"
? process.env.APP_URL_PRD
: nodeEnv === "quality"
? process.env.APP_URL_QAS
: process.env.APP_URL_DEV;

const apiUrl = nodeEnv === "production"
? process.env.API_URL_PRD
: nodeEnv === "quality"
? process.env.API_URL_QAS
: process.env.API_URL_DEV;

const dbName = nodeEnv === "production"
? process.env.DB_NAME_PRD
: nodeEnv === "quality"
? process.env.DB_NAME_QAS
: process.env.DB_NAME_DEV;

const dbUrl = nodeEnv === "production"
? process.env.ONLN_DBURL_PRD
: nodeEnv === "quality"
? process.env.ONLN_DBURL_QAS
: `${process.env.ONLN_DBURL_DEV}${dbName}?appName=shyamsahayakapp`;

const env = {
    nodeEnv: nodeEnv,
    appUrl: appUrl,
    apiUrl: apiUrl,
    port: defaultPort,
    dbName: dbName,
    dbUrl: dbUrl,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    claudeModel: process.env.CLAUDE_MODEL || "claude-sonnet-5",
    claudeMaxTokens: process.env.CLAUDE_MAX_TOKENS ? parseInt(process.env.CLAUDE_MAX_TOKENS, 10) : 1000,
};

export default env;