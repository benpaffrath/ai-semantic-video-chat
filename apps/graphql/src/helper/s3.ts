import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// S3 client configured for eu-central-1 region
const s3Client = new S3Client({ region: 'eu-central-1' })

// Cache for presigned URLs to avoid regenerating them frequently
// Stores URL and expiry timestamp to prevent unnecessary API calls
const urlCache = new Map<string, { url: string; expiry: number }>()

/**
 * Creates a presigned URL for direct file upload to S3
 * Allows clients to upload large video files directly without proxying through the server
 */
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

/**
 * Generates a presigned URL for secure file access with caching
 * Caches URLs for 1 hour to reduce S3 API calls and improve performance
 */
export async function generatePresignedUrl(objectKey: string): Promise<string> {
    const now = Date.now()

    // Check if we have a valid cached URL
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

    // Cache the URL with expiry timestamp (1 hour from now)
    urlCache.set(objectKey, { url, expiry: now + 3600 * 1000 })

    return url
}
