export enum VideoProgressStatus {
    UPLOADING = 'UPLOADING',
    TRANSCRIPTION_CREATING = 'TRANSCRIPTION_CREATING',
    EMBEDDINGS_CREATING = 'EMBEDDINGS_CREATING',
    DONE = 'DONE',
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
    duration: string
    status: VideoProgressStatus
    progress?: number
    previewImageKey?: string
    previewImageUrl: string
    videoKey?: string
    videoUrl?: string
    createdAt: string
}
