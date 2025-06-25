import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3Client = new S3Client({ region: 'eu-central-1' })

const urlCache = new Map<string, { url: string; expiry: number }>()

// Generates a presigned URL for uploading an object to S3
export async function generatePresignedUploadUrl(
    objectKey: string,
    contentType: string,
    metadata: Record<string, string>,
): Promise<string> {
    const command = new PutObjectCommand({
        Bucket: process.env['S3_VIDEO_BUCKET_NAME'],
        Key: objectKey,
        ContentType: contentType,
        Metadata: metadata,
    })

    return getSignedUrl(s3Client, command, { expiresIn: 3600 })
}

// Generates a presigned URL for downloading an object from S3, with caching
export async function generatePresignedUrl(objectKey: string): Promise<string> {
    const now = Date.now()

    if (urlCache.has(objectKey)) {
        const cached = urlCache.get(objectKey)!
        if (now < cached.expiry) {
            return cached.url
        }
    }

    const command = new GetObjectCommand({
        Bucket: process.env['S3_VIDEO_BUCKET_NAME'],
        Key: objectKey,
    })

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 })

    urlCache.set(objectKey, { url, expiry: now + 3600 * 1000 })

    return url
}
