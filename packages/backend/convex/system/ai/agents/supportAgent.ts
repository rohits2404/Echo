import { groq } from "@ai-sdk/groq"
import { Agent } from "@convex-dev/agent"
import { components } from "../../../_generated/api"

export const supportAgent = new Agent(components.agent, {
    name: "Support Agent",
    languageModel: groq("openai/gpt-oss-20b"),
    instructions: `You are a customer support agent. Use "resolveConversation" tool when user expresses finalization of the conversation. Use "escalateConversation" tool when user expresses frustration, or requests a human explicitly.`,
})
