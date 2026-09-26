"use node"

import { groq } from "@ai-sdk/groq"
import { generateText } from "ai"
import type { StorageActionWriter } from "convex/server"
import { assert } from "convex-helpers"
// Use the legacy build: it's the one meant for non-browser (Node) environments
// and does not try to load a canvas backend for pure text extraction.
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs"
import { Id } from "../_generated/dataModel"

const AI_MODELS = {
    image: groq("meta-llama/llama-4-scout-17b-16e-instruct"),
    html: groq("llama-3.3-70b-versatile"),
} as const

const SUPPORTED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
] as const

const SYSTEM_PROMPTS = {
    image: "You turn images into text. If it is a photo of a document, transcribe it. If it is not a document, describe it.",
    html: "You transform content into markdown.",
}

export type ExtractTextContentArgs = {
    storageId: Id<"_storage">
    filename: string
    bytes?: ArrayBuffer
    mimeType: string
}

export async function extractTextContent(
    ctx: { storage: StorageActionWriter },
    args: ExtractTextContentArgs
): Promise<string> {
    const { storageId, filename, bytes, mimeType } = args

    const url = await ctx.storage.getUrl(storageId)
    assert(url, "Failed to get storage URL")

    if (SUPPORTED_IMAGE_TYPES.some((type) => type === mimeType)) {
        return extractImageText(url)
    }

    if (mimeType.toLowerCase().includes("pdf")) {
        return extractPdfText(url, mimeType, filename)
    }

    if (mimeType.toLowerCase().includes("text")) {
        return extractTextFileContent(ctx, storageId, bytes, mimeType)
    }

    throw new Error(`Unsupported MIME type: ${mimeType}`)
}

async function extractTextFileContent(
    ctx: { storage: StorageActionWriter },
    storageId: Id<"_storage">,
    bytes: ArrayBuffer | undefined,
    mimeType: string
): Promise<string> {
    const arrayBuffer =
        bytes || (await (await ctx.storage.get(storageId))?.arrayBuffer())

    if (!arrayBuffer) {
        throw new Error("Failed to get file content")
    }

    const text = new TextDecoder().decode(arrayBuffer)

    if (mimeType.toLowerCase() !== "text/plain") {
        const result = await generateText({
            model: AI_MODELS.html,
            system: SYSTEM_PROMPTS.html,
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text },
                        {
                            type: "text",
                            text: "Extract the text and print it in a markdown format without explaining that you'll do so.",
                        },
                    ],
                },
            ],
        })

        return result.text
    }

    return text
}

/**
 * Groq has no native PDF/file input (unlike OpenAI's `type: "file"`), and
 * rasterizing pages to images (to reuse the vision model) turns out to need
 * a real Canvas 2D backend — which in Node means a native addon like
 * @napi-rs/canvas, and Convex's "use node" action sandbox can't load native
 * binaries. So instead of rendering pages, this reads the PDF's embedded
 * text layer directly via pdfjs-dist, which is pure JS and needs no canvas
 * at all. This covers the large majority of real PDFs (anything exported
 * from Word/Docs, or any PDF that isn't just scanned photos of pages).
 *
 * Caveat: a PDF that's purely scanned images with no text layer will come
 * back empty here, since there's no text to extract. OCR-ing those would
 * require either a vision model (blocked by the canvas issue above) or an
 * external OCR service outside Convex's sandbox.
 */
async function extractPdfText(
    url: string,
    mimeType: string,
    filename: string
): Promise<string> {
    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()

    const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
        useSystemFonts: false,
    })

    const document = await loadingTask.promise
    const pageTexts: string[] = []

    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber++) {
        const page = await document.getPage(pageNumber)
        const content = await page.getTextContent()

        const pageText = content.items
            .map((item) => ("str" in item ? item.str : ""))
            .join(" ")
            .replace(/\s+/g, " ")
            .trim()

        if (pageText.length > 0) {
            pageTexts.push(`## Page ${pageNumber}\n\n${pageText}`)
        }
    }

    await loadingTask.destroy()

    if (pageTexts.length === 0) {
        throw new Error(
            `No extractable text found in PDF "${filename}". It may be a scanned ` +
                "document with no text layer, which this pipeline can't OCR."
        )
    }

    return pageTexts.join("\n\n")
}

async function extractImageText(url: string): Promise<string> {
    const result = await generateText({
        model: AI_MODELS.image,
        system: SYSTEM_PROMPTS.image,
        messages: [
            {
                role: "user",
                content: [{ type: "image", image: new URL(url) }],
            },
        ],
    })

    return result.text
}
