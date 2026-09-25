"use client"

import { useAtomValue } from "jotai"
import { errorMessageAtom } from "../../atoms/widget-atoms"
import { WidgetHeader } from "../components/widget-header"
import { AlertTriangleIcon } from "lucide-react"

export const WidgetErrorScreen = () => {
    const errorMessage = useAtomValue(errorMessageAtom)

    return (
        <>
            <WidgetHeader>
                <div className="flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold">
                    <p className="text-3xl">Hi There! 👋</p>
                    <p className="text-lg">Let&apos;s Get You Started</p>
                </div>
            </WidgetHeader>
            <div className="flex flex-1 flex-col items-center justify-center gap-y-4 p-4 text-muted-foreground">
                <AlertTriangleIcon />
                <p className="text-sm">
                    {errorMessage || "Invalid Configuration"}
                </p>
            </div>
        </>
    )
}
