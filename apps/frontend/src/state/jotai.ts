import { atom } from 'jotai'
import type { Conversation, KnowledgeRoom, VideoObject } from '@/types'

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
