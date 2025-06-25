import Conversations from '../Conversations/Conversations'
import KnowledgeRooms from '../KnowledgeRooms/KnowledgeRooms'

export default function Sidebar() {
    return (
        <div className="w-[280px] flex flex-col gap-8 py-16">
            <h1 className="text-2xl px-8 font-bold">
                AI Semantic
                <br />
                Video Chat
            </h1>

            <KnowledgeRooms />
            <Conversations />
        </div>
    )
}
