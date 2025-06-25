import { VideoObject, VideoProgressStatus } from '@/types'
import VideoStatus from './VideoStatus'

interface VideoProps {
    video: VideoObject
}

export default function Video({ video }: VideoProps) {
    const handleClick = () => {
        window.open(video.videoUrl, '_blank')
    }

    return (
        <div
            onClick={handleClick}
            className="flex gap-4 bg-background hover:bg-black/60 p-4 rounded-lg w-full h-[92px] overflow-hidden cursor-pointer"
        >
            <div
                style={{ backgroundImage: `url('${video.previewImageUrl}')` }}
                className="bg-cover bg-center bg-white h-full aspect-video rounded-md relative"
            >
                {video.status !== VideoProgressStatus.DONE && (
                    <div className="absolute inset-0 bg-black/50 bg-opacity-50 rounded-md z-10"></div>
                )}
                <div className="bg-black/80 text-xs w-fit rounded-md px-1 p-0.5 absolute bottom-1 right-1">
                    {video.duration}
                </div>
            </div>
            <div className="flex flex-col justify-between py-1 overflow-hidden">
                <div className="font-bold overflow-hidden text-ellipsis">
                    {video.title}
                </div>
                <VideoStatus
                    status={video.status}
                    progress={video.progress}
                    createdAt={video.createdAt}
                />
            </div>
        </div>
    )
}
