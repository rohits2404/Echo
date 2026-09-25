import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import React from "react"

const Page = async () => {
    const { userId } = await auth()

    if (!userId) {
        redirect("/sign-in")
    }

    return <div>Test Page!</div>
}

export default Page
