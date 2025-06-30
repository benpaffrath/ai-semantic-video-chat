import MessagesContainer from './MessagesContainer'
import SendMessageContainer from './SendMessageContainer'

export default function ChatContainer() {
    return (
        <div className="flex flex-col h-full w-full bg-white/10 rounded-xl overflow-x-hidden">
            <div className="overflow-y-scroll flex-grow">
                <MessagesContainer />
            </div>
            <SendMessageContainer />
        </div>
    )
}
