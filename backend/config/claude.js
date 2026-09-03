import Anthropic from "@anthropic-ai/sdk";
import env from "./env.js";

const anthropicClient = new Anthropic({
    apiKey: env.anthropicApiKey,
});

export default anthropicClient;