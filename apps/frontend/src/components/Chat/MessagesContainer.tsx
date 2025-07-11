'use client'

import { LIST_CHAT_MESSAGES } from '@/graphql/queries'
import {
    currentChatMessagesAtom,
    currentConversationAtom,
    currentKnowledgeRoomAtom,
    currentVideosAtom,
    sortedChatMessagesAtom,
} from '@/state/jotai'
import { useQuery } from '@apollo/client'
import { IconMessageCirclePlus } from '@tabler/icons-react'
import { useAtom } from 'jotai'
import { useEffect, useRef, useState } from 'react'
import VideoSource from './VideoSource'
import ReactMarkdown from 'react-markdown'
import { VideoObject } from '@/types'
import VideoPlayerDialog from '../VideoPlayer/VideoPlayer'

export default function MessagesContainer() {
    const [currentVideo, setCurrentVideo] = useState<
        (VideoObject & { start: number }) | null
    >(null)

    const [currentKnowledgeRoom] = useAtom(currentKnowledgeRoomAtom)
    const [currentConversation] = useAtom(currentConversationAtom)
    const [currentVideos] = useAtom(currentVideosAtom)
    const [, setCurrentChatMessages] = useAtom(currentChatMessagesAtom)
    const [sortedChatMessages] = useAtom(sortedChatMessagesAtom)

    const lastMessageRef = useRef<HTMLDivElement>(null)

    const { data, loading } = useQuery(LIST_CHAT_MESSAGES, {
        skip: !currentKnowledgeRoom?.id || !currentConversation?.id,
        variables: {
            knowledgeRoomId: currentKnowledgeRoom?.id,
            conversationId: currentConversation?.id,
        },
        fetchPolicy: 'network-only',
    })

    useEffect(() => {
        if (data?.listChatMessages) {
            console.log(data.listChatMessages)
            setCurrentChatMessages(data.listChatMessages)
        }
    }, [currentConversation, data, setCurrentChatMessages])

    useEffect(() => {
        if (lastMessageRef.current) {
            lastMessageRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'end',
            })
        }
    }, [sortedChatMessages])

    if (loading) {
        return (
            <div className="flex flex-col h-full overflow-y-auto items-center justify-center text-center text-white/60 mx-8">
                <svg
                    aria-hidden="true"
                    className="w-12 h-12 text-white/50 animate-spin fill-primary"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="currentColor"
                    />
                    <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="currentFill"
                    />
                </svg>
            </div>
        )
    }

    if (!sortedChatMessages?.length) {
        return (
            <div className="flex flex-col h-full overflow-y-auto items-center justify-center text-center text-white/60 mx-8">
                <IconMessageCirclePlus size={96} />
                <div>
                    Start the chat by asking a question
                    <br />
                    about the added videos
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4 flex-grow overflow-y-auto justify-end text-white/60 m-8">
            {sortedChatMessages.map((message, index) => {
                const isLast = index === sortedChatMessages.length - 1
                return (
                    <div
                        key={message.id}
                        ref={isLast ? lastMessageRef : null}
                        style={{ paddingBottom: isLast ? 16 : 0 }}
                        className={`flex w-full ${
                            message.isUserMessage
                                ? 'justify-end'
                                : 'justify-start'
                        }`}
                    >
                        <div
                            className={`w-fit max-w-3/4 px-4 py-3 rounded-2xl ${
                                message.id === 'error'
                                    ? 'bg-red-200'
                                    : message.isUserMessage
                                      ? 'bg-primary text-background'
                                      : 'bg-background'
                            }`}
                        >
                            {message.id === 'loading' ? (
                                <div className="flex space-x-1 justify-center items-center h-[28px] -mb-1">
                                    <div className="h-2 w-2 bg-white/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="h-2 w-2 bg-white/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="h-2 w-2 bg-white/60 rounded-full animate-bounce"></div>
                                </div>
                            ) : message.id === 'error' ? (
                                <div className="flex space-x-1 justify-center items-center text-red-900">
                                    {message.content}
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    <ReactMarkdown>
                                        {message.content}
                                    </ReactMarkdown>
                                    {!!message?.relatedDocuments?.length && (
                                        <div className="flex gap-2">
                                            {message.relatedDocuments.map(
                                                (doc, index) => (
                                                    <VideoSource
                                                        key={`${message.id}_${index}`}
                                                        source={doc}
                                                        videos={
                                                            currentVideos || []
                                                        }
                                                        onClick={(video) =>
                                                            setCurrentVideo({
                                                                ...video,
                                                                start: doc.start,
                                                            })
                                                        }
                                                    />
                                                ),
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}
            <VideoPlayerDialog
                open={!!currentVideo}
                url={currentVideo?.videoUrl || ''}
                seek={currentVideo?.start}
                onClose={() => setCurrentVideo(null)}
            />
        </div>
    )
}
