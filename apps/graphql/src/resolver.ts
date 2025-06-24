import { Context } from './context'
import {
    insertConversation,
    insertKnowledgeRoom,
    listConversationsByKnowledgeRoom,
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
        listConversations: async (
            _,
            { knowledgeRoomId }: { knowledgeRoomId: string },
            context: Context,
        ) => {
            try {
                return await listConversationsByKnowledgeRoom(
                    knowledgeRoomId,
                    context.userId,
                )
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
        createConversation: async (
            _,
            {
                title,
                knowledgeRoomId,
            }: { title: string; knowledgeRoomId: string },
            context: Context,
        ) => {
            try {
                return await insertConversation(
                    title,
                    knowledgeRoomId,
                    context.userId,
                )
            } catch (e) {
                console.error(e)
            }
        },
    },
}

export default clientResolvers
