import { createClerkClient, WebhookEvent } from "@clerk/backend"
import { verifyWebhook } from "@clerk/backend/webhooks"
import { httpRouter } from "convex/server"
import { httpAction } from "./_generated/server"
import { internal } from "./_generated/api"

const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY || "",
})

const http = httpRouter()

http.route({
    path: "/clerk-webhook",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        console.log("CLERK WEBHOOK RECEIVED")

        const event = await validateRequest(request)

        if (!event) {
            console.log("WEBHOOK VALIDATION FAILED")

            return new Response("Webhook verification failed", {
                status: 400,
            })
        }

        console.log("WEBHOOK VERIFIED")
        console.log("EVENT TYPE:", event.type)
        console.log("EVENT DATA:", JSON.stringify(event.data, null, 2))

        switch (event.type) {
            case "subscription.updated": {
                const subscription = event.data as {
                    status: string
                    payer?: {
                        organization_id?: string
                    }
                }

                console.log("SUBSCRIPTION STATUS:", subscription.status)

                const organizationId = subscription.payer?.organization_id

                console.log("ORGANIZATION ID:", organizationId)

                if (!organizationId) {
                    console.log("❌ MISSING ORGANIZATION ID")

                    return new Response("Missing Organization ID", {
                        status: 400,
                    })
                }

                const newMaxAllowedMemberships =
                    subscription.status === "active" ? 5 : 1

                console.log(
                    "UPDATING MAX MEMBERSHIPS:",
                    newMaxAllowedMemberships
                )

                await clerkClient.organizations.updateOrganization(
                    organizationId,
                    {
                        maxAllowedMemberships: newMaxAllowedMemberships,
                    }
                )

                console.log("CLERK ORGANIZATION UPDATED")

                await ctx.runMutation(internal.system.subscriptions.upsert, {
                    organizationId,
                    status: subscription.status,
                })

                console.log("SUBSCRIPTION SAVED TO CONVEX")

                break
            }

            default:
                console.log("IGNORED CLERK WEBHOOK EVENT:", event.type)
        }

        return new Response("Webhook received", {
            status: 200,
        })
    }),
})

async function validateRequest(request: Request): Promise<WebhookEvent | null> {
    try {
        const event = await verifyWebhook(request, {
            signingSecret: process.env.CLERK_WEBHOOK_SECRET,
        })

        return event as WebhookEvent
    } catch (error) {
        console.error("WEBHOOK VERIFICATION ERROR:", error)

        return null
    }
}

export default http
