import { api } from "@workspace/backend/_generated/api"
import { Doc } from "@workspace/backend/_generated/dataModel"
import { useMutation } from "convex/react"
import { useForm } from "react-hook-form"
import { FormSchema } from "../../types"
import { zodResolver } from "@hookform/resolvers/zod"
import { widgetSettingsSchema } from "../../schemas"
import { toast } from "sonner"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@workspace/ui/components/form"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@workspace/ui/components/card"
import { Textarea } from "@workspace/ui/components/textarea"
import { Separator } from "@workspace/ui/components/separator"
import { Input } from "@workspace/ui/components/input"
import { VapiFormFields } from "./vapi-form-fields"
import { Button } from "@workspace/ui/components/button"

type WidgetSettings = Doc<"widgetSettings">

interface CustomizationFormProps {
    initialData?: WidgetSettings | null
    hasVapiPlugin: boolean
}

export const CustomizationForm = ({
    initialData,
    hasVapiPlugin,
}: CustomizationFormProps) => {
    const upsertWidgetSettings = useMutation(api.private.widgetSettings.upsert)

    const form = useForm<FormSchema>({
        resolver: zodResolver(widgetSettingsSchema),
        defaultValues: {
            greetMessage:
                initialData?.greetMessage || "Hi! How Can I Help You Today?",
            defaultSuggestions: {
                suggestion1: initialData?.defaultSuggestions.suggestion1 || "",
                suggestion2: initialData?.defaultSuggestions.suggestion2 || "",
                suggestion3: initialData?.defaultSuggestions.suggestion3 || "",
            },
            vapiSettings: {
                assistantId: initialData?.vapiSettings.assistantId || "",
                phoneNumber: initialData?.vapiSettings.phoneNumber || "",
            },
        },
    })

    const onSubmit = async (values: FormSchema) => {
        try {
            const vapiSettings: WidgetSettings["vapiSettings"] = {
                assistantId:
                    values.vapiSettings.assistantId === "none"
                        ? ""
                        : values.vapiSettings.assistantId,
                phoneNumber:
                    values.vapiSettings.phoneNumber === "none"
                        ? ""
                        : values.vapiSettings.phoneNumber,
            }

            await upsertWidgetSettings({
                greetMessage: values.greetMessage,
                defaultSuggestions: values.defaultSuggestions,
                vapiSettings,
            })

            toast.success("Widget Settings Saved")
        } catch (error) {
            console.error(error)
            toast.error("Something Went Wrong")
        }
    }

    return (
        <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                <Card>
                    <CardHeader>
                        <CardTitle>General Chat Settings</CardTitle>
                        <CardDescription>
                            Configure Basic Chat Widget Behavior And Messages
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField
                            control={form.control}
                            name="greetMessage"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Greeting Message</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            placeholder="Welcome Message Shown when Chat Open"
                                            rows={3}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        The First Message Customers See When
                                        They Open The Chat
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Separator />

                        <div className="space-y-4">
                            <div>
                                <h3 className="mb-4 text-sm">
                                    Default Suggestions
                                </h3>
                                <p className="mb-4 text-sm text-muted-foreground">
                                    Quick Reply Suggestions Shown To Customers
                                    To Help Guide The Conversation
                                </p>

                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="defaultSuggestions.suggestion1"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Suggestion 1
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="e.g., How Do I Get Started?"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="defaultSuggestions.suggestion2"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Suggestion 2
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="e.g., What Are Your Pricing Plans?"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="defaultSuggestions.suggestion3"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Suggestion 3
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="e.g., I Need Help With My Account"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {hasVapiPlugin && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Voice Assistant Settings</CardTitle>
                            <CardDescription>
                                Configure Voice Calling Features Powered By Vapi
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <VapiFormFields form={form} />
                        </CardContent>
                    </Card>
                )}

                <div className="flex justify-end">
                    <Button
                        disabled={form.formState.isSubmitting}
                        type="submit"
                    >
                        Save Settings
                    </Button>
                </div>
            </form>
        </Form>
    )
}
