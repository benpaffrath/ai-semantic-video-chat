import { ReactElement } from 'react'

interface PrimaryButtonProps {
    icon?: ReactElement
    text: string
    contained?: boolean
    onClick: () => void
}

export default function PrimaryButton({
    icon,
    text,
    contained = false,
    onClick,
}: PrimaryButtonProps) {
    return (
        <button
            onClick={onClick}
            type="button"
            className={`flex gap-2 mt-4 ml-4 items-center cursor-pointer border ${contained ? 'bg-primary text-background hover:bg-primary/80' : 'bg-transparent text-primary'} font-medium rounded-lg text-sm px-4 py-2.5 text-center border-primary hover:text-background hover:bg-primary w-fit`}
        >
            {text}
            {icon}
        </button>
    )
}
