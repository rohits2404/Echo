"use client"

import { useMutation, useQuery } from "convex/react"
import { api } from "@workspace/backend/_generated/api"
import { Button } from "@workspace/ui/components/button"
import { UserButton } from "@clerk/nextjs"

export function HomePage() {
    const users = useQuery(api.users.getMany)
    const addUser = useMutation(api.users.add)

    return (
        <div className="flex min-h-svh flex-col items-center justify-center">
            <p>apps/web</p>
            <UserButton />
            <Button onClick={() => addUser()}>Add</Button>
            <div className="mx-auto w-full max-w-sm">
                {JSON.stringify(users, null, 2)}
            </div>
        </div>
    )
}
