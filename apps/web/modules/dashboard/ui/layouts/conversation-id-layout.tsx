"use client"

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@workspace/ui/components/resizable"
import { ContactPanel } from "../components/contact-panel"

export const ConversationIdLayout = ({
    children,
}: {
    children: React.ReactNode
}) => {
    return (
        <ResizablePanelGroup className="h-full w-full" direction="horizontal">
            <ResizablePanel defaultSize={60} minSize={60}>
                <div className="flex h-full min-h-0 flex-col">{children}</div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={40} minSize={20} maxSize={40}>
                <div className="h-full min-h-0">
                    <ContactPanel />
                </div>
            </ResizablePanel>
        </ResizablePanelGroup>
    )
}
