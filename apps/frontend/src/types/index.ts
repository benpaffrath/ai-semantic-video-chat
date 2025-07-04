import type { JSX as Jsx } from 'react/jsx-runtime'

declare global {
    /* eslint-disable @typescript-eslint/no-namespace */
    namespace JSX {
        type ElementClass = Jsx.ElementClass
        type Element = Jsx.Element
        type IntrinsicElements = Jsx.IntrinsicElements
    }
}

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
    previewImage?: string
    videoKey?: string
    videoUrl?: string
    type?: string
    file?: File
    uploadUrl?: string
    createdAt?: string
}

export interface RelatedDocument {
    videoId: string
    start: number
    end: number
}

export interface ChatMessage {
    id: string
    content: string
    isUserMessage: boolean
    relatedDocuments: RelatedDocument[]
    createdAt: string
}
