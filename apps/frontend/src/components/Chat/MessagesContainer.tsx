import { sortedChatMessagesAtom } from '@/state/jotai'
import { IconMessageCirclePlus } from '@tabler/icons-react'
import { useAtom } from 'jotai'

export default function MessagesContainer() {
    const [sortedChatMessages] = useAtom(sortedChatMessagesAtom)

    if (!sortedChatMessages?.length) {
        return (
            <div className="flex flex-col h-full overflow-y-auto items-center justify-center text-center text-white/60 mx-8">
                <IconMessageCirclePlus size={96} />
                <div>
                    Start the chat by asking a question
                    <br />
                    about the added videos
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4 flex-grow overflow-y-auto justify-end text-white/60 m-8">
            {sortedChatMessages.map((message, i) => (
                <div
                    key={i}
                    className={`flex w-full ${message.isUserMessage ? 'justify-end' : 'justify-start'}`}
                >
                    <div className="w-fit max-w-2/3 bg-background px-4 py-3 rounded-2xl">
                        {message.content}
                    </div>
                </div>
            ))}
        </div>
    )
}
