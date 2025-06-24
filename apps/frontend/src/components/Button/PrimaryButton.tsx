import { ReactElement } from 'react'

interface PrimaryButtonProps {
    icon?: ReactElement
    text: string
    onClick: () => void
}

export default function PrimaryButton({
    icon,
    text,
    onClick,
}: PrimaryButtonProps) {
    return (
        <button
            onClick={onClick}
            type="button"
            className="flex gap-2 mt-4 ml-4 items-center cursor-pointer border font-medium rounded-lg text-sm px-4 py-2.5 text-center border-primary text-primary hover:text-background hover:bg-primary w-fit"
        >
            {text}
            {icon}
        </button>
    )
}
