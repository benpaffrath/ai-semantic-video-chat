import { useState, useRef, useEffect } from 'react'
import PrimaryButton from '../Button/PrimaryButton'
import SecondaryButton from '../Button/SecondaryButton'

interface BasicInputDialogProps {
    open: boolean
    title: string
    submitButtonText: string
    loading?: boolean
    onClose: () => void
    onSubmit: (value: string) => void
}

export default function BasicInputDialog({
    open,
    title,
    submitButtonText,
    loading = false,
    onSubmit,
    onClose,
}: BasicInputDialogProps) {
    const [inputValue, setInputValue] = useState<string>('')
    const [inputError, setInputError] = useState<boolean>(false)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (open) {
            setInputValue('')
            setInputError(false)
            setTimeout(() => {
                inputRef.current?.focus()
            }, 10)
        }
    }, [open])

    if (!open) return null

    const handleSubmitClick = () => {
        const title = inputValue?.trim()

        if (title.length < 4) {
            return setInputError(true)
        }

        setInputError(false)
        onSubmit(title)
    }

    const handleClose = () => {
        setInputValue('')
        setInputError(false)
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="relative bg-paper rounded-lg shadow-xl p-6 w-full max-w-md">
                {loading && (
                    <div className="absolute inset-0 bg-background/20 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-lg">
                        <div className="w-8 h-8 border-4 border-background border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                <h2 className="text-xl text-background font-semibold mb-4">
                    {title}
                </h2>

                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className={`w-full border ${
                        inputError
                            ? 'border-red-600'
                            : 'border-gray-300 focus:ring-1 focus:ring-primary'
                    } rounded-lg px-3 py-2.5 focus:outline-none mb-4 text-background`}
                    placeholder="Title..."
                    disabled={loading}
                />

                <div className="flex justify-end items-center space-x-0 h-[58px]">
                    <SecondaryButton
                        text="Cancel"
                        contained
                        onClick={handleClose}
                    />
                    <PrimaryButton
                        text={submitButtonText}
                        contained
                        onClick={handleSubmitClick}
                    />
                </div>
            </div>
        </div>
    )
}
