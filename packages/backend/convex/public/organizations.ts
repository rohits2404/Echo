import { createClerkClient } from "@clerk/backend"
import { action } from "../_generated/server"
import { v } from "convex/values"

const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY || "",
})

export const validate = action({
    args: {
        organizationId: v.string(),
    },
    handler: async (_, args) => {
        try {
            const organization =
                await clerkClient.organizations.getOrganization({
                    organizationId: args.organizationId,
                })

            return {
                valid: true,
                organization: {
                    id: organization.id,
                    name: organization.name,
                    slug: organization.slug,
                    imageUrl: organization.imageUrl,
                },
            }
        } catch (error) {
            console.error("Clerk organization lookup failed", error)
            return { valid: false, reason: "Organization Not Valid" }
        }
    },
})
