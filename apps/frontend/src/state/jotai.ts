import { atom } from 'jotai'
import type {
    ChatMessage,
    Conversation,
    KnowledgeRoom,
    VideoObject,
} from '@/types'

export const currentKnowledgeRoomAtom = atom<KnowledgeRoom | null>(null)
export const currentConversationAtom = atom<Conversation | null>(null)

export const currentVideosAtom = atom<VideoObject[]>([])

export const sortedVideosAtom = atom((get) =>
    [...get(currentVideosAtom)].sort(
        (a: VideoObject, b: VideoObject) =>
            new Date(b.createdAt || new Date()).getTime() -
            new Date(a.createdAt || new Date()).getTime(),
    ),
)

export const currentChatMessagesAtom = atom<ChatMessage[]>([])

export const sortedChatMessagesAtom = atom((get) =>
    [...get(currentChatMessagesAtom)].sort(
        (a: ChatMessage, b: ChatMessage) =>
            new Date(a.createdAt || new Date()).getTime() -
            new Date(b.createdAt || new Date()).getTime(),
    ),
)

export const loadingAtom = atom<{
    knowledgeRoom: boolean
    conversations: boolean
    videos: boolean
}>({
    knowledgeRoom: true,
    conversations: true,
    videos: false,
})
