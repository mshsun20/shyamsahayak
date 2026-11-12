
import { registerTool } from "../ai.tool.registry.js";

import {
    searchKnowledgeBase,
} from "./knowledgeBase.tool.service.js";


/* ------------------------------------------------------------------
   Knowledge Base AI Tool
------------------------------------------------------------------ */

const knowledgeBaseTool = {

    name: "search_knowledge_base",

    description: `
Searches the company's uploaded Knowledge Base documents and articles
for technical information, product specifications, installation
instructions, warranties, certifications, test results, and other
document-based information.

Use this tool when the user asks questions about:

- Product specifications
- AZ 70, AZ 150, and other product variants
- Salt spray test ratings
- Paint thickness and coating specifications
- Warranty periods
- Protective layers
- Technical product comparisons
- Installation procedures
- Product performance
- Information contained in uploaded PPTX, PDF, Word, or other
  indexed Knowledge Base documents.

IMPORTANT:

1. Always search the Knowledge Base for technical questions.
2. Do not assume that the product catalog contains technical
   specifications from uploaded documents.
3. Use the returned content as the source of truth.
4. Do not invent specifications when no matching information exists.
5. When answering, mention the source document title and Knowledge
   Base code whenever available.
6. If no relevant information is returned, clearly state that the
   information could not be found in the available Knowledge Base.
7. Do not treat a failed Product Catalog search as proof that the
   information does not exist in the Knowledge Base.
`,

    input_schema: {

        type: "object",

        properties: {

            query: {
                type: "string",

                description:
                    "The technical or document-related question to search for in the Knowledge Base.",
            },

            category: {
                type: "string",

                description:
                    "Optional Knowledge Base category filter.",
            },

            limit: {
                type: "integer",

                minimum: 1,

                maximum: 20,

                description:
                    "Maximum number of relevant document chunks to retrieve. Defaults to 8.",
            },

        },

        required: ["query"],

        additionalProperties: false,
    },


    /* --------------------------------------------------------------
       Execute Knowledge Base search
    -------------------------------------------------------------- */

    execute: async ({ input = {}, context = {} }) => {

        /*
         * User identity must come from trusted backend context.
         * Claude must never supply userId.
         */

        if (!context.userId) {
            throw new Error(
                "Authenticated user context is required."
            );
        }


        const query = String(input.query || "").trim();

        if (!query) {
            throw new Error(
                "Knowledge Base search query is required."
            );
        }


        return searchKnowledgeBase({

            query,

            category: input.category || "",

            limit: input.limit || 8,

            userId: context.userId,

        });
    },
};


registerTool(knowledgeBaseTool);


export default knowledgeBaseTool;
