"use client"

import { GlobeIcon, PhoneCallIcon, PhoneIcon, WorkflowIcon } from "lucide-react"
import { Feature, PluginCard } from "../components/plugin-card"
import { z } from "zod"
import { useMutation, useQuery } from "convex/react"
import { api } from "@workspace/backend/_generated/api"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@workspace/ui/components/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@workspace/ui/components/form"
import { Label } from "@workspace/ui/components/label"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import { useState } from "react"

const vapiFeatures: Feature[] = [
    {
        icon: GlobeIcon,
        label: "Web Voice Calls",
        description: "Voice Chat Directly In Your App",
    },
    {
        icon: PhoneIcon,
        label: "Phone Numbers",
        description: "Get Dedicated Business Lines",
    },
    {
        icon: PhoneCallIcon,
        label: "Outbound Calls",
        description: "Automated Customer Outreach",
    },
    {
        icon: WorkflowIcon,
        label: "Workflows",
        description: "Custom Conversation Flows",
    },
]

const formSchema = z.object({
    publicApiKey: z.string().min(1, { message: "Public API Key Is Required" }),
    privateApiKey: z
        .string()
        .min(1, { message: "Private API Key Is Required" }),
})

const VapiPluginForm = ({
    open,
    setOpen,
}: {
    open: boolean
    setOpen: (value: boolean) => void
}) => {
    const upsertSecret = useMutation(api.private.secrets.upsert)
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            publicApiKey: "",
            privateApiKey: "",
        },
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await upsertSecret({
                service: "vapi",
                value: {
                    publicApiKey: values.publicApiKey,
                    privateApiKey: values.privateApiKey,
                },
            })
            setOpen(false)
            toast.success("Vapi Secret Created")
        } catch (error) {
            console.error(error)
            toast.error("Something Went Wrong")
        }
    }

    return (
        <Dialog onOpenChange={setOpen} open={open}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Enable Vapi</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                    Your API Keys Are Safely Encrypted And Stored Using AWS
                    Secrets Manager.
                </DialogDescription>
                <Form {...form}>
                    <form
                        className="flex flex-col gap-y-4"
                        onSubmit={form.handleSubmit(onSubmit)}
                    >
                        <FormField
                            control={form.control}
                            name="publicApiKey"
                            render={({ field }) => (
                                <FormItem>
                                    <Label>Public API Key</Label>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="Your Public API Key"
                                            type="text"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="privateApiKey"
                            render={({ field }) => (
                                <FormItem>
                                    <Label>Private API Key</Label>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="Your Private API Key"
                                            type="text"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button
                                disabled={form.formState.isSubmitting}
                                type="submit"
                            >
                                {form.formState.isSubmitting
                                    ? "Connecting..."
                                    : "Connect"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export const VapiView = () => {
    const vapiPlugin = useQuery(api.private.plugins.getOne, { service: "vapi" })

    const [connectOpen, setConnectOpen] = useState(false)
    const [removeOpen, setRemoveOpen] = useState(false)

    const handleSubmit = () => {
        if (vapiPlugin) {
            setRemoveOpen(true)
        } else {
            setConnectOpen(true)
        }
    }

    return (
        <>
            <VapiPluginForm open={connectOpen} setOpen={setConnectOpen} />
            <div className="flex min-h-screen flex-col bg-muted p-8">
                <div className="mx-auto w-full max-w-3xl">
                    <div className="space-y-2">
                        <h1 className="text-2xl md:text-4xl">Vapi Plugin</h1>
                        <p className="text-muted-foreground">
                            Connect Vapi To Enable AI Voice Calls And Phone
                            Support
                        </p>
                    </div>

                    <div className="mt-8">
                        {vapiPlugin ? (
                            <p>Connected!!</p>
                        ) : (
                            <PluginCard
                                serviceImage="/vapi.jpg"
                                serviceName="Vapi"
                                features={vapiFeatures}
                                isDisabled={vapiPlugin === undefined}
                                onSubmit={handleSubmit}
                            />
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
