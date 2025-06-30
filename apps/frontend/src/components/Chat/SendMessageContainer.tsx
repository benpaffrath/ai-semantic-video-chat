import { SEND_CHAT_MESSAGE } from '@/graphql/mutations'
import {
    currentChatMessagesAtom,
    currentConversationAtom,
    currentKnowledgeRoomAtom,
} from '@/state/jotai'
import { ChatMessage } from '@/types'
import { useApolloClient } from '@apollo/client'
import { IconSend } from '@tabler/icons-react'
import { useAtom } from 'jotai'
import { nanoid } from 'nanoid'
import { useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from 'react'

export default function SendMessageContainer() {
    const client = useApolloClient()

    const [, setCurrentChatMessages] = useAtom(currentChatMessagesAtom)
    const [currentKnowledgeRoom] = useAtom(currentKnowledgeRoomAtom)
    const [currentConversation] = useAtom(currentConversationAtom)

    const [value, setValue] = useState('')
    const textareaRef = useRef<HTMLTextAreaElement | null>(null)

    const lineHeight = 24

    const onChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setValue(e.target.value)

        const el = textareaRef.current
        if (!el) return

        el.style.height = 'auto'
        const newHeight = Math.min(el.scrollHeight, lineHeight * 4)
        el.style.height = newHeight + 'px'
    }

    const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            if (value.trim()) {
                handleSubmit()
            }
        }
    }

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = lineHeight + 'px'
        }
    }, [])

    const handleSubmit = async () => {
        const userCreatedAt = new Date()

        const userMessage: ChatMessage = {
            id: nanoid(),
            content: value,
            isUserMessage: true,
            createdAt: new Date(userCreatedAt).toUTCString(),
        }

        const loadingMessage: ChatMessage = {
            id: 'loading',
            content: '...',
            isUserMessage: false,
            createdAt: new Date(userCreatedAt.getTime() + 1000).toUTCString(),
        }

        setCurrentChatMessages((prev) => [userMessage, ...prev])
        setValue('')

        const timeout = setTimeout(() => {
            setCurrentChatMessages((prev) => [loadingMessage, ...prev])
        }, 400)

        try {
            const res = await client.mutate({
                mutation: SEND_CHAT_MESSAGE,
                variables: {
                    input: {
                        id: userMessage.id,
                        content: userMessage.content,
                    },
                    knowledgeRoomId: currentKnowledgeRoom?.id,
                    conversationId: currentConversation?.id,
                },
            })

            clearTimeout(timeout)

            setCurrentChatMessages((prev) => {
                const withoutLoading = prev.filter(
                    (msg) => msg.id !== 'loading',
                )
                return [res.data.sendChatMessage, ...withoutLoading]
            })
        } catch (e) {
            console.error(e)
            clearTimeout(timeout)
            setCurrentChatMessages((prev) =>
                prev.filter((msg) => msg.id !== 'loading'),
            )
        }
    }

    return (
        <div className="flex gap-4 bg-paper rounded-y-xl p-8 mx-0 mb-0">
            <textarea
                ref={textareaRef}
                className="w-full text-black resize-none border-none focus:outline-none focus:ring-0"
                placeholder="Ask a question..."
                rows={1}
                value={value}
                onChange={onChange}
                onKeyDown={onKeyDown}
                style={{ lineHeight: lineHeight + 'px', overflowY: 'auto' }}
            />
            <button
                className="text-background disabled:text-gray-300 disabled:cursor-not-allowed"
                disabled={!value.trim()}
                onClick={handleSubmit}
            >
                <IconSend />
            </button>
        </div>
    )
}
