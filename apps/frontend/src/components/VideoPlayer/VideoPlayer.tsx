import { IconX } from '@tabler/icons-react'
import { useEffect, useRef } from 'react'
import ReactPlayer from 'react-player'

type VideoPlayerDialogProps = {
    url: string
    seek?: number
    open: boolean
    onClose: () => void
}

export default function VideoPlayerDialog({
    url,
    seek,
    open,
    onClose,
}: VideoPlayerDialogProps) {
    const playerRef = useRef<HTMLVideoElement | null>(null)

    useEffect(() => {
        if (open && seek != null && playerRef.current) {
            playerRef.current.currentTime = seek
        }
    }, [open, seek])

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs">
            <div className="relative rounded-xl shadow-2xl w-full max-w-3xl aspect-video bg-black">
                <button
                    onClick={onClose}
                    className="absolute -top-8 -right-8 z-10 p-1.5 cursor-pointer rounded-full transition text-white"
                >
                    <IconX />
                </button>

                <ReactPlayer
                    ref={playerRef}
                    src={url}
                    playing
                    controls
                    width="100%"
                    height="100%"
                    className="rounded-xl overflow-hidden"
                />
            </div>
        </div>
    )
}
