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

export interface Video {
    id: string
    title: string
    videoKey: string
    videoUrl: string
    duration: number
    previewImage: string
    type: string
    status: string
    createdAt: string
}

export interface RelatedDocuments {
    videoId: string
    start: number
    end: number
}

export interface ChatMessage {
    id: string
    content: string
    isUserMessage: boolean
    relatedDocuments: RelatedDocuments[]
    createdAt: string
}
