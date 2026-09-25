import { query, mutation } from "./_generated/server"

export const getMany = query({
    args: {},
    handler: async (ctx) => {
        const users = await ctx.db.query("users").collect()
        return users
    },
})

export const add = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity()

        if (identity === null) {
            throw new Error("Not Authenticated")
        }

        const org = identity.o as
            { id: string; rol: string; slg: string } | undefined

        if (!org?.id) {
            throw new Error("Missing Organization")
        }

        const userId = await ctx.db.insert("users", {
            name: "John",
        })

        return userId
    },
})
