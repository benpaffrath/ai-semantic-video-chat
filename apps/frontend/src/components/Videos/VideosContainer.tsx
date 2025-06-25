import { VideoProgressStatus } from '@/types'
import Video from './Video'

export default function VideosContainer() {
    return (
        <div className="flex flex-col gap-2 w-[350px]">
            <Video
                video={{
                    id: '1',
                    title: 'Video1.mp4',
                    duration: '12:48',
                    status: VideoProgressStatus.UPLOADING,
                    progress: 73,
                    previewImageKey: '',
                    previewImageUrl:
                        'https://image.geo.de/30141740/t/kd/v4/w1440/r0/-/01-monatsgewinner-2018-05-lars-lykke-cewe-owib-jpg--80669-.jpg',
                    videoKey: '',
                    videoUrl: 'https://www.youtube.com/watch?v=zWh3CShX_do',
                    createdAt: new Date().toUTCString(),
                }}
            />
            <Video
                video={{
                    id: '1',
                    title: 'Video1.mp4',
                    duration: '12:48',
                    status: VideoProgressStatus.TRANSCRIPTION_CREATING,
                    previewImageKey: '',
                    previewImageUrl:
                        'https://image.geo.de/30141740/t/kd/v4/w1440/r0/-/01-monatsgewinner-2018-05-lars-lykke-cewe-owib-jpg--80669-.jpg',
                    videoKey: '',
                    videoUrl: 'https://www.youtube.com/watch?v=zWh3CShX_do',
                    createdAt: new Date().toUTCString(),
                }}
            />
            <Video
                video={{
                    id: '1',
                    title: 'Video1.mp4sfwefwefjweflwefwefw',
                    duration: '12:48',
                    status: VideoProgressStatus.EMBEDDINGS_CREATING,
                    previewImageKey: '',
                    previewImageUrl:
                        'https://image.geo.de/30141740/t/kd/v4/w1440/r0/-/01-monatsgewinner-2018-05-lars-lykke-cewe-owib-jpg--80669-.jpg',
                    videoKey: '',
                    videoUrl: 'https://www.youtube.com/watch?v=zWh3CShX_do',
                    createdAt: new Date().toUTCString(),
                }}
            />
            <Video
                video={{
                    id: '1',
                    title: 'Video1.mp4',
                    duration: '12:48',
                    status: VideoProgressStatus.DONE,
                    createdAt: new Date().toUTCString(),
                    previewImageKey: '',
                    previewImageUrl:
                        'https://image.geo.de/30141740/t/kd/v4/w1440/r0/-/01-monatsgewinner-2018-05-lars-lykke-cewe-owib-jpg--80669-.jpg',
                    videoKey: '',
                    videoUrl: 'https://www.youtube.com/watch?v=zWh3CShX_do',
                }}
            />
        </div>
    )
}
