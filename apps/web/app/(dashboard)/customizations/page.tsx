import { PremiumFeatureOverlay } from "@/modules/billing/ui/components/premium-feature-overlay"
import { CustomizationView } from "@/modules/customization/ui/views/customization-view"
import { Show } from "@clerk/nextjs"
import React from "react"

const Page = () => {
    return (
        <Show
            when={(has) => has({ plan: "pro" })}
            fallback={
                <PremiumFeatureOverlay>
                    <CustomizationView />
                </PremiumFeatureOverlay>
            }
        >
            <CustomizationView />
        </Show>
    )
}

export default Page
