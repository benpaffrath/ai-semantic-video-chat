'use client'

import { IconLayoutDashboard, IconPlus } from '@tabler/icons-react'
import { useState, useEffect } from 'react'
import PrimaryButton from '../Button/PrimaryButton'
import { currentKnowledgeRoomAtom, currentVideosAtom } from '@/state/jotai'
import { useAtom } from 'jotai'
import BasicInputDialog from '../BasicInputDialog/BasicInputDialog'
import { CREATE_KNOWLEDGE_ROOM } from '@/graphql/mutations'
import { LIST_KNOWLEDGE_ROOMS } from '@/graphql/queries'
import { KnowledgeRoom } from '@/types'
import { useApolloClient, useQuery } from '@apollo/client'
import ContentLoader from 'react-content-loader'

export default function KnowledgeRooms() {
    const client = useApolloClient()

    const [openDialog, setOpenDialog] = useState<boolean>(false)
    const [submitLoading, setSubmitLoading] = useState<boolean>(false)

    const [currentKnowledgeRoom, setCurrentKnowledgeRoom] = useAtom(
        currentKnowledgeRoomAtom,
    )

    const [, setCurrentVideos] = useAtom(currentVideosAtom)

    const { data, loading } = useQuery(LIST_KNOWLEDGE_ROOMS, {
        fetchPolicy: 'network-only',
    })

    const rooms = [...(data?.listKnowledgeRooms || [])]?.sort(
        (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )

    /**
     * Select the first Knowledge Room by default
     */
    useEffect(() => {
        if (!loading && rooms.length > 0 && !currentKnowledgeRoom) {
            setCurrentKnowledgeRoom(rooms[0])
        }
    }, [loading, rooms, currentKnowledgeRoom, setCurrentKnowledgeRoom])

    const handleNewKnowledgeRoomDialog = () => {
        setOpenDialog(!openDialog)
    }

    const handleKnowledgeRoomChange = (knowledgeRoom: KnowledgeRoom) => {
        if (currentKnowledgeRoom?.id !== knowledgeRoom?.id) {
            setCurrentKnowledgeRoom(knowledgeRoom)
            setCurrentVideos([])
        }
    }

    const handleSubmit = async (title: string) => {
        setSubmitLoading(true)

        try {
            const response = await client.mutate({
                mutation: CREATE_KNOWLEDGE_ROOM,
                variables: {
                    title,
                },
                refetchQueries: [{ query: LIST_KNOWLEDGE_ROOMS }],
                awaitRefetchQueries: true,
            })

            handleKnowledgeRoomChange(response?.data?.createKnowledgeRoom)
        } catch (e) {
            console.error(e)
        }

        handleNewKnowledgeRoomDialog()
        setSubmitLoading(false)
    }

    return (
        <div className="flex flex-col gap-1 px-4">
            <div className="px-4 mb-2 text-white/60 text-sm">
                Knowledge Rooms
            </div>
            <div className="flex flex-col gap-1 max-h-[152px] min-h-[152px] overflow-x-auto">
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
                {!loading && !rooms?.length && (
                    <div className="px-4 ">
                        Create a Knowledge Room!
                        <br />
                        <br />
                        With a Knowledge Room you can bundle knowledge on a
                        specific topic and chat only on that information.
                    </div>
                )}
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
            </div>
            <PrimaryButton
                text="New Knowledge Room"
                icon={<IconPlus size={21} />}
                onClick={handleNewKnowledgeRoomDialog}
            />
            <BasicInputDialog
                open={!!openDialog}
                title="New Knowledge Room"
                submitButtonText="Create Knowledge Room"
                onClose={handleNewKnowledgeRoomDialog}
                onSubmit={handleSubmit}
                loading={submitLoading}
            />
        </div>
    )
}
