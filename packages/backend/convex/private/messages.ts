import { ConvexError, v } from "convex/values"
import { action, mutation, query } from "../_generated/server"
import { saveMessage } from "@convex-dev/agent"
import { components } from "../_generated/api"
import { paginationOptsValidator } from "convex/server"
import { supportAgent } from "../system/ai/agents/supportAgent"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { OPERATOR_MESSAGE_ENHANCEMENT_PROMPT } from "../system/ai/constants"

export const enhanceResponse = action({
    args: {
        prompt: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()

        if (identity === null) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Identity not found",
            })
        }

        const org = identity.o as
            { id: string; rol: string; slg: string } | undefined

        if (!org?.id) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Organization not found",
            })
        }

        const response = await generateText({
            model: groq("openai/gpt-oss-20b"),
            messages: [
                {
                    role: "system",
                    content: OPERATOR_MESSAGE_ENHANCEMENT_PROMPT,
                },
                {
                    role: "user",
                    content: args.prompt,
                },
            ],
        })

        return response.text
    },
})

export const create = mutation({
    args: {
        prompt: v.string(),
        conversationId: v.id("conversations"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()

        if (identity === null) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Identity not found",
            })
        }

        const org = identity.o as
            { id: string; rol: string; slg: string } | undefined

        if (!org?.id) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Organization not found",
            })
        }

        const orgId = org.id

        const conversation = await ctx.db.get(args.conversationId)

        if (!conversation) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Conversation not found",
            })
        }

        if (conversation.organizationId !== orgId) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Invalid Organization ID",
            })
        }

        if (conversation.status === "resolved") {
            throw new ConvexError({
                code: "BAD_REQUEST",
                message: "Conversation resolved",
            })
        }

        if (conversation.status === "unresolved") {
            await ctx.db.patch(args.conversationId, {
                status: "escalated",
            })
        }

        await saveMessage(ctx, components.agent, {
            threadId: conversation.threadId,
            // TODO: Check if "agentName" is needed or not
            agentName: identity.familyName,
            message: {
                role: "assistant",
                content: args.prompt,
            },
        })
    },
})

export const getMany = query({
    args: {
        threadId: v.string(),
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()

        if (identity === null) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Identity not found",
            })
        }

        const org = identity.o as
            { id: string; rol: string; slg: string } | undefined

        if (!org?.id) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Organization not found",
            })
        }

        const orgId = org.id

        const conversation = await ctx.db
            .query("conversations")
            .withIndex("by_thread_id", (q) => q.eq("threadId", args.threadId))
            .unique()

        if (!conversation) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Conversation not found",
            })
        }

        if (conversation.organizationId !== orgId) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Invalid Organization ID",
            })
        }

        const paginated = await supportAgent.listMessages(ctx, {
            threadId: args.threadId,
            paginationOpts: args.paginationOpts,
        })

        return paginated
    },
})
