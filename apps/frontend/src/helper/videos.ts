/**
 * Generates a preview image (thumbnail) from a given video file at a specified time.
 *
 * @param {File} file
 * @param {number} [seekTo=1]
 * @returns {Promise<string>}
 */
export const generateVideoPreviewImage = (
    file: File,
    seekTo = 2,
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video')
        video.preload = 'metadata'

        video.onloadedmetadata = () => {
            if (video.duration < seekTo) seekTo = 0
            video.currentTime = seekTo
        }

        video.onseeked = () => {
            const canvas = document.createElement('canvas')
            const maxWidth = 160
            const maxHeight = 90
            const ratio = Math.min(
                maxWidth / video.videoWidth,
                maxHeight / video.videoHeight,
            )

            canvas.width = video.videoWidth * ratio
            canvas.height = video.videoHeight * ratio

            const ctx = canvas.getContext('2d')
            if (!ctx) {
                reject('Canvas context is null')
                return
            }
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
            const imgUrl = canvas.toDataURL('image/png')
            resolve(imgUrl)
            URL.revokeObjectURL(video.src) // Clean up
        }

        video.onerror = () => reject('Error loading video')

        video.src = URL.createObjectURL(file)
    })
}

/**
 * Retrieves the duration of a given video file in seconds.
 *
 * @param {File} file
 * @returns {Promise<number>}
 */
export const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video')
        video.preload = 'metadata'

        video.onloadedmetadata = () => {
            URL.revokeObjectURL(video.src)
            resolve(video.duration)
        }

        video.onerror = () => {
            reject(new Error('Failed to load video metadata.'))
        }

        video.src = URL.createObjectURL(file)
    })
}
