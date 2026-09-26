import { createTool } from "@convex-dev/agent"
import { z } from "zod"
import { internal } from "../../../_generated/api"
import rag from "../rag"
import { generateText } from "ai"
import { SEARCH_INTERPRETER_PROMPT } from "../constants"
import { groq } from "@ai-sdk/groq"
import { supportAgent } from "../agents/supportAgent"

export const search = createTool({
    description:
        "Search the knowledge base for relevant information to help answer user questions",

    inputSchema: z.object({
        query: z
            .string()
            .describe("The search query to find relevant information"),
    }),

    execute: async (ctx, args) => {
        if (!ctx.threadId) {
            return "Missing thread ID"
        }

        const conversation = await ctx.runQuery(
            internal.system.conversations.getByThreadId,
            { threadId: ctx.threadId }
        )

        if (!conversation) {
            return "Conversation not found"
        }

        const orgId = conversation.organizationId

        const searchResult = await rag.search(ctx, {
            namespace: orgId,
            query: args.query,
            limit: 5,
        })

        const contextText = `Found results in ${searchResult.entries
            .map((e) => e.title || null)
            .filter((t) => t !== null)
            .join(", ")}. Here is the context:\n\n${searchResult.text}`

        const response = await generateText({
            model: groq("openai/gpt-oss-20b"),
            instructions: SEARCH_INTERPRETER_PROMPT,
            prompt: `User asked: "${args.query}"\n\nSearch results: ${contextText}`,
        })

        await supportAgent.saveMessage(ctx, {
            threadId: ctx.threadId,
            message: {
                role: "assistant",
                content: response.text,
            },
        })

        return response.text
    },
})
