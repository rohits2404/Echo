import { ConvexError, v } from "convex/values"
import { query } from "../_generated/server"

export const getOneByConversationId = query({
    args: {
        conversationId: v.id("conversations"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()

        if (identity === null) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Unauthorized",
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
                message: "Invalid organization id",
            })
        }

        const contactSession = await ctx.db.get(conversation.contactSessionId)

        return contactSession
    },
})
