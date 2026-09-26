import { RAG } from "@convex-dev/rag"
import { components } from "../../_generated/api"
import { google } from "@ai-sdk/google"

const rag = new RAG(components.rag, {
    textEmbeddingModel: google.embedding("gemini-embedding-2"),
    embeddingDimension: 768,
})

export default rag
