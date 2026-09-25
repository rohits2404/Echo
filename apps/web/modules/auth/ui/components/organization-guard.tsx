"use client"

import { useOrganization, useAuth } from "@clerk/nextjs"
import { AuthLayout } from "../layouts/auth-layout"
import { OrgSelectionView } from "../views/org-selection-view"

export const OrganizationGuard = ({
    children,
}: {
    children: React.ReactNode
}) => {
    const { organization } = useOrganization()
    const { orgId, isLoaded } = useAuth()

    if (!isLoaded) {
        return (
            <AuthLayout>
                <p>Loading...</p>
            </AuthLayout>
        )
    }

    if (!organization) {
        return (
            <AuthLayout>
                <p>Clerk orgId: {orgId ?? "NONE"}</p>
                <OrgSelectionView />
            </AuthLayout>
        )
    }

    return <>{children}</>
}
