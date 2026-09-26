import { z } from "zod"

export const widgetSettingsSchema = z.object({
    greetMessage: z.string().min(1, "Greeting Message Is Required"),
    defaultSuggestions: z.object({
        suggestion1: z.string().optional(),
        suggestion2: z.string().optional(),
        suggestion3: z.string().optional(),
    }),
    vapiSettings: z.object({
        assistantId: z.string().optional(),
        phoneNumber: z.string().optional(),
    }),
})
