export enum VideoProgressStatus {
    INIT = 'INIT',
    UPLOADING = 'UPLOADING',
    TRANSCRIPTION_CREATING = 'TRANSCRIPTION_CREATING',
    EMBEDDINGS_CREATING = 'EMBEDDINGS_CREATING',
    DONE = 'DONE',
    ERROR = 'ERROR',
}

export interface KnowledgeRoom {
    id: string
    title: string
    createdAt: string
}

export interface Conversation {
    id: string
    title: string
    createdAt: string
}

export interface VideoObject {
    id: string
    title: string
    duration: number
    status: VideoProgressStatus
    progress?: number
    previewImageKey?: string
    previewImageUrl?: string
    videoKey?: string
    videoUrl?: string
    type?: string
    file?: File
    uploadUrl?: string
    createdAt?: string
}
