'use client'

import { CREATE_UPLOAD_URLS, CREATE_VIDEO } from '@/graphql/mutations'
import {
    ACCEPTED_VIDEO_MAX,
    ACCEPTED_VIDEO_SIZE,
    uploadFileToS3,
} from '@/helper/fileUpload'
import { generateVideoPreviewImage, getVideoDuration } from '@/helper/videos'
import { currentKnowledgeRoomAtom, currentVideosAtom } from '@/state/jotai'
import { VideoObject, VideoProgressStatus } from '@/types'
import { useApolloClient } from '@apollo/client'
import { IconFilePlus } from '@tabler/icons-react'
import { useAtom } from 'jotai'
import { nanoid } from 'nanoid'
import { useState } from 'react'
import { useDropzone } from 'react-dropzone'

export default function FileUploadDropzone() {
    const client = useApolloClient()
    const [, setCurrentVideos] = useAtom(currentVideosAtom)
    const [currentKnowledgeRoom] = useAtom(currentKnowledgeRoomAtom)

    const [isDragOver, setIsDragOver] = useState<boolean>(false)

    /**
     * Generate VideoObjects asynchronously and update state immediately.
     * Returns array of generated VideoObjects
     */
    const generateVideoObjectsAsync = async (
        files: File[],
    ): Promise<VideoObject[]> => {
        const videoObjects: VideoObject[] = []

        for (const file of files) {
            try {
                const duration = await getVideoDuration(file)
                const previewImage = await generateVideoPreviewImage(file)

                const videoObject: VideoObject = {
                    id: nanoid(),
                    title: file.name,
                    duration,
                    previewImage,
                    progress: 0,
                    status: VideoProgressStatus.INIT,
                    uploadUrl: '',
                    type: file.type,
                    file,
                }

                videoObjects.push(videoObject)

                // Update state immediately
                setCurrentVideos((prev) => [videoObject, ...(prev ?? [])])

                await new Promise((res) => setTimeout(res, 150)) // slight delay for UI
            } catch (e) {
                console.error('Error processing video file:', file.name, e)
            }
        }

        return videoObjects
    }

    /**
     * Handle dropped files, generate video objects, get upload URLs,
     * update state, and start uploads.
     */
    const handleFileDrop = async (acceptedFiles: File[]) => {
        setIsDragOver(false)

        // Step 1: Generate VideoObjects with stable IDs and update UI
        const videoObjects = await generateVideoObjectsAsync(acceptedFiles)

        // Step 2: Request pre-signed upload URLs using the generated IDs
        const { data } = await client.mutate({
            mutation: CREATE_UPLOAD_URLS,
            variables: {
                input: videoObjects.map((file) => ({
                    id: file.id,
                    key: file.title,
                    fileName: file.title,
                    fileType: file.type,
                })),
            },
        })

        // Step 3: Map upload URLs into video objects, update status to UPLOADING
        const updatedVideoObjects = videoObjects.map((file) => {
            const uploadUrl = data?.createUploadUrls.find(
                (u: { id: string }) => u.id === file.id,
            )?.uploadUrl

            return uploadUrl
                ? {
                      ...file,
                      uploadUrl,
                      status: VideoProgressStatus.UPLOADING,
                  }
                : file
        })

        // Step 4: Update currentVideos with upload URLs and status
        setCurrentVideos((prev) => {
            if (!prev) return updatedVideoObjects
            return prev.map((prevFile) => {
                const updatedFile = updatedVideoObjects.find(
                    (f) => f.id === prevFile.id,
                )
                return updatedFile ? { ...prevFile, ...updatedFile } : prevFile
            })
        })

        // Step 5: Start upload and track progress/status
        await Promise.all(
            updatedVideoObjects.map((file) =>
                uploadFileToS3(
                    file.file!,
                    file.uploadUrl,
                    (progress) => updateProgress(file.id, progress),
                    () => handleUploadSuccess(file),
                    () => handleUploadError(file.id),
                ),
            ),
        )
    }

    const updateProgress = (id: string, progress: number) => {
        setCurrentVideos((prev) =>
            prev?.map((file) =>
                file.id === id ? { ...file, progress } : file,
            ),
        )
    }

    const handleUploadSuccess = async (file: VideoObject) => {
        const res = await client.mutate({
            mutation: CREATE_VIDEO,
            variables: {
                input: {
                    id: file.id,
                    title: file.title,
                    duration: file.duration,
                    previewImage: file.previewImage,
                    videoKey: file.title,
                    type: file.type,
                },
                knowledgeRoomId: currentKnowledgeRoom?.id,
            },
        })

        setCurrentVideos((prev) =>
            prev?.map((f) => (f.id === file.id ? res?.data?.createVideo : f)),
        )
    }

    const handleUploadError = (id: string) => {
        setCurrentVideos((prev) =>
            prev?.map((file) =>
                file.id === id
                    ? { ...file, status: VideoProgressStatus.ERROR }
                    : file,
            ),
        )
    }

    const { getRootProps, getInputProps } = useDropzone({
        accept: { 'video/*': [] },
        maxFiles: ACCEPTED_VIDEO_MAX,
        maxSize: ACCEPTED_VIDEO_SIZE,
        onDragOver: () => setIsDragOver(true),
        onDragLeave: () => setIsDragOver(false),
        onDrop: handleFileDrop,
    })

    return (
        <div
            {...getRootProps()}
            style={{ borderColor: isDragOver ? 'var(--primary)' : '' }}
            className="text-center border-dashed rounded-lg cursor-pointer border-2 border-white/40 hover:border-primary"
        >
            <input {...getInputProps()} />
            <div className="flex flex-col justify-center items-center gap-4 p-8 text-white/60">
                <IconFilePlus size={48} />
                <div className="text-sm">
                    Add videos to the Knowledge Room...
                </div>
            </div>
        </div>
    )
}
