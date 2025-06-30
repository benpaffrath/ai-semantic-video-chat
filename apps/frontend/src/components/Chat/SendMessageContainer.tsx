import { currentChatMessagesAtom } from '@/state/jotai'
import { ChatMessage } from '@/types'
import { IconSend } from '@tabler/icons-react'
import { useAtom } from 'jotai'
import { nanoid } from 'nanoid'
import { useState, useRef, useEffect, ChangeEvent } from 'react'

export default function SendMessageContainer() {
    const [, setCurrentChatMessages] = useAtom(currentChatMessagesAtom)

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

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = lineHeight + 'px'
        }
    }, [])

    const handleSubmit = async () => {
        const message: ChatMessage = {
            id: nanoid(),
            content: value,
            isUserMessage: true,
            createdAt: new Date().toUTCString(),
        }

        setCurrentChatMessages((prev) => [message, ...prev])
        setValue('')
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
                style={{ lineHeight: lineHeight + 'px', overflowY: 'auto' }}
            />
            <button
                className="text-background disabled:text-gray-300 disabled:cursor-not-allowed"
                disabled={!value}
                onClick={handleSubmit}
            >
                <IconSend />
            </button>
        </div>
    )
}
