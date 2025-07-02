import { VideoObject, VideoProgressStatus } from '@/types'
import VideoStatus from './VideoStatus'

interface VideoProps {
    video: VideoObject
    onClick: (video: VideoObject) => void
}

export default function Video({ video, onClick }: VideoProps) {
    const secondsToHHMMSS = (totalSeconds: number): string => {
        const hours = Math.floor(totalSeconds / 3600)
        const minutes = Math.floor((totalSeconds % 3600) / 60)
        const seconds = Math.floor(totalSeconds % 60)

        const pad = (num: number) => String(num).padStart(2, '0')
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    }

    return (
        <div
            onClick={() => onClick(video)}
            className="flex gap-4 bg-background hover:bg-black/60 p-4 rounded-lg w-full h-[92px] overflow-hidden cursor-pointer"
        >
            <div
                style={{ backgroundImage: `url('${video.previewImage}')` }}
                className="bg-cover bg-center bg-white h-full aspect-video rounded-md relative"
            >
                {video.status !== VideoProgressStatus.DONE && (
                    <div className="absolute inset-0 bg-black/50 bg-opacity-50 rounded-md z-10"></div>
                )}
                <div className="bg-black/80 text-xs w-fit rounded-md px-1 p-0.5 absolute bottom-1 right-1 text-white">
                    {secondsToHHMMSS(video.duration || 0)}
                </div>
            </div>
            <div className="flex flex-col justify-between py-1 overflow-hidden">
                <div className="font-bold overflow-hidden text-ellipsis whitespace-nowrap">
                    {video.title}
                </div>
                <VideoStatus
                    status={video.status}
                    progress={video.progress}
                    createdAt={video?.createdAt}
                />
            </div>
        </div>
    )
}
