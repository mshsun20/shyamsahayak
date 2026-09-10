import dotenv from "dotenv";
dotenv.config({ quiet: true });

const requiredEnvVariables = [
    "NODE_ENV",
    "PORT_PRD",
    "PORT_QAS",
    "PORT_DEV",
    "API_USR",
    "API_PSS",
    "APP_URL_PRD",
    "APP_URL_QAS",
    "APP_URL_DEV",
    "ADMIN_URL_PRD",
    "ADMIN_URL_QAS",
    "ADMIN_URL_DEV",
    "API_URL_PRD",
    "API_URL_QAS",
    "API_URL_DEV",
    "DB_NAME_PRD",
    "DB_NAME_QAS",
    "DB_NAME_DEV",
    "ONLN_DBURL_PRD",
    "ONLN_DBURL_QAS",
    "ONLN_DBURL_DEV",
    "JWT_ACCESS_SECRET",
    "JWT_REFRESH_SECRET",
    "JWT_CHALLENGE_SECRET",
    "ACCESS_EXP_PRD",
    "ACCESS_EXP_QAS",
    "ACCESS_EXP_DEV",
    "REFRESH_EXP_PRD",
    "REFRESH_EXP_QAS",
    "REFRESH_EXP_DEV",
    "CHALLENGE_EXP_PRD",
    "CHALLENGE_EXP_QAS",
    "CHALLENGE_EXP_DEV",
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

const apiUser = process.env.API_USR;
const apiPass = process.env.API_PSS;

const appUrl = nodeEnv === "production"
? process.env.APP_URL_PRD
: nodeEnv === "quality"
? process.env.APP_URL_QAS
: process.env.APP_URL_DEV;

const adminUrl = nodeEnv === "production"
? process.env.ADMIN_URL_PRD
: nodeEnv === "quality"
? process.env.ADMIN_URL_QAS
: process.env.ADMIN_URL_DEV;

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

const jwtAccessSecret = process.env.JWT_ACCESS_SECRET;
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
const jwtChallengeSecret = process.env.JWT_CHALLENGE_SECRET;

const accessTokenExpiry = nodeEnv === "production"
? process.env.ACCESS_EXP_PRD
: nodeEnv === "quality"
? process.env.ACCESS_EXP_QAS
: process.env.ACCESS_EXP_DEV;

const refreshTokenExpiry = nodeEnv === "production"
? process.env.REFRESH_EXP_PRD
: nodeEnv === "quality"
? process.env.REFRESH_EXP_QAS
: process.env.REFRESH_EXP_DEV;

const challengeTokenExpiry = nodeEnv === "production"
? process.env.CHALLENGE_EXP_PRD
: nodeEnv === "quality"
? process.env.CHALLENGE_EXP_QAS
: process.env.CHALLENGE_EXP_DEV;

const env = {
    nodeEnv: nodeEnv,
    apiUsr: apiUser,
    apiPss: apiPass,
    appUrl: appUrl,
    adminUrl: adminUrl,
    apiUrl: apiUrl,
    port: defaultPort,
    dbName: dbName,
    dbUrl: dbUrl,
    accessExpiry: accessTokenExpiry,
    refreshExpiry: refreshTokenExpiry,
    challengeExpiry: challengeTokenExpiry,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    jwtAccess: jwtAccessSecret,
    jwtRefresh: jwtRefreshSecret,
    jwtChallenge: jwtChallengeSecret,
    claudeModel: process.env.CLAUDE_MODEL || "claude-sonnet-5",
    claudeMaxTokens: process.env.CLAUDE_MAX_TOKENS ? parseInt(process.env.CLAUDE_MAX_TOKENS, 10) : 1000,
};

export default env;