import { atom } from 'jotai'
import type { Conversation, KnowledgeRoom } from '@/types'

export const currentKnowledgeRoomAtom = atom<KnowledgeRoom | null>(null)
export const currentConversationAtom = atom<Conversation | null>(null)
