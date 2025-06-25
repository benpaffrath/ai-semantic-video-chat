import { ReactElement } from 'react'

interface SecondaryButtonProps {
    icon?: ReactElement
    text: string
    contained?: boolean
    onClick: () => void
}

export default function SecondaryButton({
    icon,
    text,
    contained = false,
    onClick,
}: SecondaryButtonProps) {
    return (
        <button
            onClick={onClick}
            type="button"
            className={`flex gap-2 mt-4 ml-4 items-center cursor-pointer border ${contained ? 'bg-black/10 text-background hover:bg-black/15' : 'bg-transparent text-background'} font-medium rounded-lg text-sm px-4 py-2.5 text-center border-black/10 hover:text-background hover:bg-black/10 w-fit`}
        >
            {text}
            {icon}
        </button>
    )
}
