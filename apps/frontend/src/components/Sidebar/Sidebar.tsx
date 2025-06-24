'use client'

import {
    IconLayoutDashboard,
    IconMessageCircle,
    IconPlus,
} from '@tabler/icons-react'
import PrimaryButton from '../Button/PrimaryButton'
import { useAtom } from 'jotai'
import {
    currentKnowledgeRoomAtom,
    currentConversationAtom,
} from '../../state/jotai'
import type { KnowledgeRoom, Conversation } from '@/types'

export default function Sidebar() {
    const rooms = [
        { id: '1', title: 'Knowledge Room I', createdAt: '' },
        { id: '2', title: 'Knowledge Room II', createdAt: '' },
        { id: '3', title: 'Knowledge Room III', createdAt: '' },
    ]

    const conversations = [
        { id: '1', title: 'Conversation I', createdAt: '' },
        { id: '2', title: 'Conversation II', createdAt: '' },
        { id: '3', title: 'Conversation III', createdAt: '' },
    ]

    const [currentKnowledgeRoom, setCurrentKnowledgeRoom] = useAtom(
        currentKnowledgeRoomAtom,
    )
    const [currentConversation, setCurrentConversation] = useAtom(
        currentConversationAtom,
    )

    const handleKnowledgeRoomChange = (knowledgeRoom: KnowledgeRoom) => {
        setCurrentKnowledgeRoom(knowledgeRoom)
    }

    const handleConversationChange = (conversation: Conversation) => {
        setCurrentConversation(conversation)
    }

    const handleNewKnowledgeRoomClick = () => {}

    const handleNewConversationClick = () => {}

    return (
        <div className="w-[280px] flex flex-col gap-8 py-16">
            <h1 className="text-2xl px-8 font-bold">
                AI Semantic
                <br />
                Video Chat
            </h1>

            <div className="flex flex-col gap-1 px-4">
                <div className="px-4 mb-2 text-white/60 text-sm">
                    Knowledge Rooms
                </div>
                {rooms.map((room) => (
                    <div
                        onClick={() => handleKnowledgeRoomChange(room)}
                        key={room.id}
                        className={`flex items-center gap-4 px-4 py-3 cursor-pointer rounded-lg hover:bg-black/40 ${currentKnowledgeRoom?.id === room.id ? 'bg-black/80 text-white' : 'text-white/80'}`}
                    >
                        <IconLayoutDashboard />
                        {room.title}
                    </div>
                ))}
                <PrimaryButton
                    text="New Knowledge Room"
                    icon={<IconPlus size={21} />}
                    onClick={handleNewKnowledgeRoomClick}
                />
            </div>

            <div className="flex flex-col gap-1 px-4">
                <div className="px-4 mb-2 text-white/60 text-sm">
                    Conversations
                </div>
                {conversations.map((conversation) => (
                    <div
                        onClick={() => handleConversationChange(conversation)}
                        key={conversation.id}
                        className={`flex items-center gap-4 px-4 py-3 cursor-pointer rounded-lg hover:bg-black/40 ${currentConversation?.id === conversation.id ? 'bg-black/80 text-white' : 'text-white/80'}`}
                    >
                        <IconMessageCircle />
                        {conversation.title}
                    </div>
                ))}
                <PrimaryButton
                    text="New Conversation"
                    icon={<IconPlus size={21} />}
                    onClick={handleNewConversationClick}
                />
            </div>
        </div>
    )
}
