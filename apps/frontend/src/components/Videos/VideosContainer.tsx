import Video from './Video'
import FileUploadDropzone from '../FileUpload/FileUploadDropzone'
import {
    currentKnowledgeRoomAtom,
    currentVideosAtom,
    sortedVideosAtom,
} from '@/state/jotai'
import { useAtom } from 'jotai'
import { LIST_VIDEOS } from '@/graphql/queries'
import { useQuery } from '@apollo/client'
import { useEffect } from 'react'
import ContentLoader from 'react-content-loader'

export default function VideosContainer() {
    const [, setCurrentVideos] = useAtom(currentVideosAtom)
    const [sortedVideos] = useAtom(sortedVideosAtom)
    const [currentKnowledgeRoom] = useAtom(currentKnowledgeRoomAtom)

    const { data, loading } = useQuery(LIST_VIDEOS, {
        skip: !currentKnowledgeRoom?.id,
        fetchPolicy: 'network-only',
        pollInterval: 2000,
        variables: {
            knowledgeRoomId: currentKnowledgeRoom?.id,
        },
    })

    useEffect(() => {
        if (data?.listVideos?.length) {
            setCurrentVideos((prev) => {
                const videoMap = new Map(prev.map((video) => [video.id, video]))

                for (const newVideo of data.listVideos) {
                    // replace video
                    videoMap.set(newVideo.id, newVideo)
                }

                return Array.from(videoMap.values())
            })
        }
    }, [data])

    return (
        <div className="flex flex-col gap-4 w-[350px]">
            <FileUploadDropzone />
            <div className="overflow-x-auto">
                <div className="flex flex-col gap-2 ">
                    {loading ? (
                        <ContentLoader
                            uniqueKey="videos"
                            speed={1}
                            width="100%"
                            height={400}
                            backgroundColor="#1A494D"
                            foregroundColor="#315C5F"
                        >
                            {[0, 1, 2].map((i) => (
                                <rect
                                    key={i}
                                    x="0"
                                    y={i * 100}
                                    rx="16"
                                    ry="16"
                                    width="100%"
                                    height="92"
                                />
                            ))}
                        </ContentLoader>
                    ) : (
                        sortedVideos?.map((video) => (
                            <Video video={video} key={video.id} />
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
