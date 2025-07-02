import { RelatedDocument, VideoObject } from '@/types'

interface VideoSourceProps {
    videos: VideoObject[]
    source: RelatedDocument
}

export default function VideoSource({ videos, source }: VideoSourceProps) {
    const currentVideo: VideoObject = videos?.filter(
        (v) => v.id === source?.videoId,
    )?.[0]

    const secondsToHHMMSS = (totalSeconds: number): string => {
        const hours = Math.floor(totalSeconds / 3600)
        const minutes = Math.floor((totalSeconds % 3600) / 60)
        const seconds = Math.floor(totalSeconds % 60)

        const pad = (num: number) => String(num).padStart(2, '0')
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    }

    return (
        <div className="w-full max-w-1/2 bg-black/20 hover:bg-black/40 cursor-pointer rounded-md px-4 py-2 overflow-hidden">
            <div className="text-sm font-bold overflow-hidden text-ellipsis whitespace-nowrap">
                {currentVideo?.title}
            </div>
            <div className="text-xs">
                {secondsToHHMMSS(source.start)} - {secondsToHHMMSS(source.end)}
            </div>
        </div>
    )
}
