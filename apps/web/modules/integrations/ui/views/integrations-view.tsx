"use client"

import { useOrganization } from "@clerk/nextjs"
import { useState } from "react"
import { IntegrationId, INTEGRATIONS } from "../../constants"
import { toast } from "sonner"
import { createScript } from "../../utils"
import { Label } from "@workspace/ui/components/label"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import { CopyIcon } from "lucide-react"
import { Separator } from "@workspace/ui/components/separator"
import Image from "next/image"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@workspace/ui/components/dialog"

export const IntegrationsView = () => {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selectedSnippet, setSelectedSnippet] = useState("")
    const { organization } = useOrganization()

    const handleIntegrationClick = (integrationId: IntegrationId) => {
        if (!organization) {
            toast.error("Organization ID not found")
            return
        }

        const snippet = createScript(integrationId, organization.id)
        setSelectedSnippet(snippet)
        setDialogOpen(true)
    }

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(organization?.id ?? "")
            toast.success("Copied to clipboard")
        } catch {
            toast.error("Failed to copy to clipboard")
        }
    }

    return (
        <>
            <IntegrationsDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                snippet={selectedSnippet}
            />
            <div className="flex min-h-screen flex-col bg-muted p-8">
                <div className="mx-auto w-full max-w-3xl">
                    <div className="space-y-2">
                        <h1 className="text-2xl md:text-4xl">
                            Setup & Integrations
                        </h1>
                        <p className="text-muted-foreground">
                            Choose The Integration That&apos;s Right For You
                        </p>
                    </div>
                    <div className="mt-8 space-y-6">
                        <div className="flex items-center gap-4">
                            <Label className="w-34" htmlFor="organization-id">
                                Organization ID
                            </Label>
                            <Input
                                disabled
                                id="organization-id"
                                readOnly
                                value={organization?.id ?? ""}
                                className="flex-1 bg-background font-mono text-sm"
                            />
                            <Button
                                className="gap-2"
                                onClick={handleCopy}
                                size="sm"
                            >
                                <CopyIcon className="size-4" />
                                Copy
                            </Button>
                        </div>
                    </div>

                    <Separator className="my-8" />
                    <div className="space-y-6">
                        <div className="space-y-1">
                            <Label className="text-lg">Integrations</Label>
                            <p className="text-sm text-muted-foreground">
                                Add The Following Code To Your Website To Enable
                                The Chatbox.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            {INTEGRATIONS.map((integration) => (
                                <button
                                    key={integration.id}
                                    onClick={() =>
                                        handleIntegrationClick(integration.id)
                                    }
                                    type="button"
                                    className="flex items-center gap-4 rounded-lg border bg-background p-4 hover:bg-accent"
                                >
                                    <Image
                                        alt={integration.title}
                                        height={32}
                                        src={integration.icon}
                                        width={32}
                                    />
                                    <p>{integration.title}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export const IntegrationsDialog = ({
    open,
    onOpenChange,
    snippet,
}: {
    open: boolean
    onOpenChange: (value: boolean) => void
    snippet: string
}) => {
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(snippet)
            toast.success("Copied To Clipboard")
        } catch {
            toast.error("Failed To Copy To Clipboard")
        }
    }

    return (
        <Dialog onOpenChange={onOpenChange} open={open}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Integrate With Your Website</DialogTitle>
                    <DialogDescription>
                        Follow These Steps To Add The Chatbox To Your Website
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <div className="rounded-md bg-accent p-2 text-sm">
                            1. Copy The Following Code
                        </div>
                        <div className="group relative">
                            <pre className="max-h-75 overflow-x-auto overflow-y-auto rounded-md bg-foreground p-2 font-mono text-sm break-all whitespace-pre-wrap text-secondary">
                                {snippet}
                            </pre>
                            <Button
                                className="absolute top-4 right-6 size-6 opacity-0 transition-opacity group-hover:opacity-100"
                                onClick={handleCopy}
                                size="icon"
                                variant="secondary"
                            >
                                <CopyIcon className="size-3" />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="rounded-md bg-accent p-2 text-sm">
                            2. Add The Code In Your Page
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Paste The Chatbox Code Above In Your Page. You Can
                            Add It In The HTML Head Section.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
