import axios from 'axios'

// Maximum number of videos that can be uploaded simultaneously
export const ACCEPTED_VIDEO_MAX = 10
// Maximum file size limit (1GB) to prevent excessive storage usage
export const ACCEPTED_VIDEO_SIZE = 1000000000 // 1 GB

/**
 * Uploads a file directly to S3 using presigned URL
 * Bypasses server to handle large video files efficiently
 */
export const uploadFileToS3 = async (
    uploadFile: File,
    uploadUrl: string,
    onProgress: (progress: number) => void,
    onDone: () => void,
    onError: () => void,
) => {
    try {
        await axios.put(uploadUrl, uploadFile, {
            headers: {
                'Content-Type': uploadFile.type,
                // Cache headers for better performance on subsequent requests
                'Cache-Control': 'max-age=3600, public',
                Expires: new Date(Date.now() + 3600 * 1000).toUTCString(),
            },
            onUploadProgress: (progressEvent) => {
                if (progressEvent.lengthComputable) {
                    // Calculate upload progress percentage for UI feedback
                    const progress = Math.floor(
                        (progressEvent.loaded / (progressEvent?.total || 1)) *
                            100,
                    )
                    onProgress(progress)
                }
            },
        })

        onDone()
    } catch (e) {
        console.error(e)
        onError()
    }
}
