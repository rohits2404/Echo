import { groq } from "@ai-sdk/groq"
import { Agent, stepCountIs } from "@convex-dev/agent"
import { components } from "../../../_generated/api"
import { SUPPORT_AGENT_PROMPT } from "../constants"

export const supportAgent = new Agent(components.agent, {
    name: "Support Agent",
    languageModel: groq("openai/gpt-oss-20b"),
    instructions: SUPPORT_AGENT_PROMPT,
    stopWhen: stepCountIs(5),
})
