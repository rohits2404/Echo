"use node"

import {
    contentHashFromArrayBuffer,
    guessMimeTypeFromContents,
    guessMimeTypeFromExtension,
} from "@convex-dev/rag"
import { action } from "../_generated/server"
import { ConvexError, v } from "convex/values"
import rag from "../system/ai/rag"
import { extractTextContent } from "../lib/extractTextContent"
import { Id } from "../_generated/dataModel"

function guessMimeType(filename: string, bytes: ArrayBuffer): string {
    return (
        guessMimeTypeFromExtension(filename) ||
        guessMimeTypeFromContents(bytes) ||
        "application/octet-stream"
    )
}

export const addFile = action({
    args: {
        filename: v.string(),
        mimeType: v.string(),
        bytes: v.bytes(),
        category: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()

        if (identity === null) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Identity not found",
            })
        }

        const org = identity.o as
            { id: string; rol: string; slg: string } | undefined

        if (!org?.id) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Organization not found",
            })
        }

        const orgId = org.id

        const { bytes, filename, category } = args

        const mimeType = args.mimeType || guessMimeType(filename, bytes)
        const blob = new Blob([bytes], { type: mimeType })

        const storageId = await ctx.storage.store(blob)

        const text = await extractTextContent(ctx, {
            storageId,
            filename,
            bytes,
            mimeType,
        })

        const { entryId, created } = await rag.add(ctx, {
            // SUPER IMPORTANT: What search space to add this to. You cannot search across namespaces,
            // If not added, it will be considered global (we do not want this)
            namespace: orgId,
            text,
            key: filename,
            title: filename,
            metadata: {
                storageId, // Important for file deletion
                uploadedBy: orgId, // Important for deletion
                filename,
                category: category ?? null,
            } as EntryMetadata,
            contentHash: await contentHashFromArrayBuffer(bytes), // To avoid re-inserting if the file content hasn't changed
        })

        if (!created) {
            console.debug("entry already exists, skipping upload metadata")
            await ctx.storage.delete(storageId)
        }

        return {
            url: await ctx.storage.getUrl(storageId),
            entryId,
        }
    },
})

type EntryMetadata = {
    storageId: Id<"_storage">
    uploadedBy: string
    filename: string
    category: string | null
}
