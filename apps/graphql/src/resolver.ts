import { Context } from './context'
import {
    insertKnowledgeRoom,
    listKnowledgeRoomsByUserId,
} from './helper/dynamodb'

const clientResolvers = {
    Query: {
        listKnowledgeRooms: async (_, __, context: Context) => {
            try {
                return await listKnowledgeRoomsByUserId(context.userId)
            } catch (e) {
                console.error(e)
            }
        },
    },
    Mutation: {
        createKnowledgeRoom: async (
            _,
            { title }: { title: string },
            context: Context,
        ) => {
            try {
                return await insertKnowledgeRoom(title, context.userId)
            } catch (e) {
                console.error(e)
            }
        },
    },
}

export default clientResolvers
