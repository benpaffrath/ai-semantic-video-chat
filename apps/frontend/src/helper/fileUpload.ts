import axios from 'axios'

export const ACCEPTED_VIDEO_MAX = 10
export const ACCEPTED_VIDEO_SIZE = 1000000000 // 1 GB

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
                'Cache-Control': 'max-age=3600, public',
                Expires: new Date(Date.now() + 3600 * 1000).toUTCString(),
            },
            onUploadProgress: (progressEvent) => {
                if (progressEvent.lengthComputable) {
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
