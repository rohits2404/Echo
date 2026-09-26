import {
    GetObjectCommand,
    HeadObjectCommand,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3"

const BUCKET = process.env.B2_BUCKET!

function createB2Client(): S3Client {
    return new S3Client({
        region: process.env.B2_REGION || "us-east-005",
        endpoint: process.env.B2_ENDPOINT,
        credentials: {
            accessKeyId: process.env.B2_KEY_ID || "",
            secretAccessKey: process.env.B2_APPLICATION_KEY || "",
        },
    })
}

export function createSecretsManagerClient(): S3Client {
    return createB2Client()
}

export async function getSecretValue(
    secretName: string
): Promise<string | null> {
    const client = createB2Client()

    try {
        const response = await client.send(
            new GetObjectCommand({
                Bucket: BUCKET,
                Key: secretName,
            })
        )

        if (!response.Body) {
            return null
        }

        return await response.Body.transformToString()
    } catch (error: any) {
        if (error?.$metadata?.httpStatusCode === 404) {
            return null
        }

        throw error
    }
}

export async function upsertSecret(
    secretName: string,
    secretValue: Record<string, unknown>
): Promise<void> {
    const client = createB2Client()

    await client.send(
        new PutObjectCommand({
            Bucket: BUCKET,
            Key: secretName,
            Body: JSON.stringify(secretValue),
            ContentType: "application/json",
        })
    )
}

export async function secretExists(secretName: string): Promise<boolean> {
    const client = createB2Client()

    try {
        await client.send(
            new HeadObjectCommand({
                Bucket: BUCKET,
                Key: secretName,
            })
        )

        return true
    } catch (error: any) {
        if (error?.$metadata?.httpStatusCode === 404) {
            return false
        }

        throw error
    }
}

export function parseSecretString<T = Record<string, unknown>>(
    secret: string | null
): T | null {
    if (!secret) {
        return null
    }

    try {
        return JSON.parse(secret) as T
    } catch {
        return null
    }
}
