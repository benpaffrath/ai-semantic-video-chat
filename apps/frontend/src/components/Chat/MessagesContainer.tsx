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
            {sortedChatMessages.map((message) => (
                <div
                    key={message.id}
                    className={`flex w-full ${message.isUserMessage ? 'justify-end' : 'justify-start'}`}
                >
                    <div
                        className={`w-fit max-w-2/3 px-4 py-3 rounded-2xl ${message.isUserMessage ? 'bg-primary text-background' : 'bg-background'}`}
                    >
                        {message.id === 'loading' ? (
                            <div className="flex space-x-1 justify-center items-center h-[28px] -mb-1">
                                <div className="h-2 w-2 bg-white/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="h-2 w-2 bg-white/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="h-2 w-2 bg-white/60 rounded-full animate-bounce"></div>
                            </div>
                        ) : (
                            message.content
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}
