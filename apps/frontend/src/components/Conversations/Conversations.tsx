'use client'

import { IconLayoutDashboard, IconPlus } from '@tabler/icons-react'
import { useState, useEffect } from 'react'
import PrimaryButton from '../Button/PrimaryButton'
import {
    currentConversationAtom,
    currentKnowledgeRoomAtom,
} from '@/state/jotai'
import { useAtom } from 'jotai'
import BasicInputDialog from '../BasicInputDialog/BasicInputDialog'
import { CREATE_CONVERSATION } from '@/graphql/mutations'
import { LIST_CONVERSATIONS } from '@/graphql/queries'
import { Conversation } from '@/types'
import { useApolloClient, useQuery } from '@apollo/client'
import ContentLoader from 'react-content-loader'

export default function Conversations() {
    const client = useApolloClient()

    const [openDialog, setOpenDialog] = useState<boolean>(false)
    const [submitLoading, setSubmitLoading] = useState<boolean>(false)

    const [currentConversation, setCurrentConversation] = useAtom(
        currentConversationAtom,
    )

    const [currentKnowledgeRoom] = useAtom(currentKnowledgeRoomAtom)

    const { data, loading, refetch } = useQuery(LIST_CONVERSATIONS, {
        skip: !currentKnowledgeRoom?.id,
        variables: {
            knowledgeRoomId: currentKnowledgeRoom?.id,
        },
        fetchPolicy: 'network-only',
    })

    const conversations = [...(data?.listConversations || [])]?.sort(
        (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )

    /**
     * Select the first Conversation by default
     */
    useEffect(() => {
        if (!loading && conversations.length > 0 && !currentConversation) {
            setCurrentConversation(conversations[0])
        }
    }, [loading, conversations, currentConversation, setCurrentConversation])

    /**
     * if the knwoledge room changes,
     * load all chats of the new knowledge room and select the first chat
     */
    useEffect(() => {
        if (currentKnowledgeRoom) {
            refetch().then((result) => {
                const newConversations = [
                    ...(result.data?.listConversations || []),
                ]?.sort(
                    (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime(),
                )
                if (
                    newConversations.length > 0 &&
                    (!currentConversation ||
                        currentConversation.id !== newConversations[0].id)
                ) {
                    setCurrentConversation(newConversations[0])
                }
            })
        }
    }, [
        currentKnowledgeRoom,
        currentConversation,
        refetch,
        setCurrentConversation,
    ])

    const handleNewConversationDialog = () => {
        setOpenDialog(!openDialog)
    }

    const handleConversationChange = (conversation: Conversation) => {
        setCurrentConversation(conversation)
    }

    const handleSubmit = async (title: string) => {
        setSubmitLoading(true)

        try {
            const response = await client.mutate({
                mutation: CREATE_CONVERSATION,
                variables: {
                    title,
                    knowledgeRoomId: currentKnowledgeRoom?.id,
                },
                refetchQueries: [
                    {
                        query: LIST_CONVERSATIONS,
                        variables: {
                            knowledgeRoomId: currentKnowledgeRoom?.id,
                        },
                    },
                ],
                awaitRefetchQueries: true,
            })

            handleConversationChange(response?.data?.createConversation)
        } catch (e) {
            console.error(e)
        }

        handleNewConversationDialog()
        setSubmitLoading(false)
    }

    return (
        <div className="flex flex-col gap-1 px-4">
            <div className="px-4 mb-2 text-white/60 text-sm">
                Knowledge Rooms
            </div>
            <div className="flex flex-col gap-1 max-h-[152px] overflow-x-auto">
                {loading && (
                    <ContentLoader
                        uniqueKey="c"
                        speed={1}
                        width={248}
                        height={152}
                        viewBox="0 0 248 152"
                        backgroundColor="#1A494D"
                        foregroundColor="#315C5F"
                    >
                        <rect
                            x="16"
                            y="12"
                            rx="4"
                            ry="4"
                            width="24"
                            height="24"
                        />
                        <rect
                            x="56"
                            y="15.5"
                            rx="4"
                            ry="4"
                            width="180"
                            height="17"
                        />

                        <rect
                            x="16"
                            y="64"
                            rx="4"
                            ry="4"
                            width="24"
                            height="24"
                        />
                        <rect
                            x="56"
                            y="67.5"
                            rx="4"
                            ry="4"
                            width="180"
                            height="17"
                        />

                        <rect
                            x="16"
                            y="116"
                            rx="4"
                            ry="4"
                            width="24"
                            height="24"
                        />
                        <rect
                            x="56"
                            y="119.5"
                            rx="4"
                            ry="4"
                            width="180"
                            height="17"
                        />
                    </ContentLoader>
                )}
                {conversations.map((conversation) => (
                    <div
                        onClick={() => handleConversationChange(conversation)}
                        key={conversation.id}
                        className={`flex items-center gap-4 px-4 py-3 cursor-pointer rounded-lg hover:bg-black/40 ${currentConversation?.id === conversation.id ? 'bg-black/80 text-white' : 'text-white/80'}`}
                    >
                        <IconLayoutDashboard />
                        {conversation.title}
                    </div>
                ))}
            </div>
            {!loading && (
                <PrimaryButton
                    text="New Conversation"
                    icon={<IconPlus size={21} />}
                    onClick={handleNewConversationDialog}
                />
            )}

            <BasicInputDialog
                open={!!openDialog}
                title="New Conversation"
                submitButtonText="Create Conversation"
                onClose={handleNewConversationDialog}
                onSubmit={handleSubmit}
                loading={submitLoading}
            />
        </div>
    )
}
