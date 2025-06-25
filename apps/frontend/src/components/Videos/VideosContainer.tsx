import Video from './Video'
import FileUploadDropzone from '../FileUpload/FileUploadDropzone'
import { currentVideosAtom } from '@/state/jotai'
import { useAtom } from 'jotai'

export default function VideosContainer() {
    const [currentVideos] = useAtom(currentVideosAtom)

    return (
        <div className="flex flex-col gap-4 w-[350px]">
            <FileUploadDropzone />
            <div className="flex flex-col gap-2">
                {currentVideos?.map((video) => (
                    <Video video={video} key={video.id} />
                ))}
            </div>
        </div>
    )
}
