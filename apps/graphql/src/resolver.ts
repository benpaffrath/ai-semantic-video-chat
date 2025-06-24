import { Context } from './context'
import { insertKnowledeRoom } from './helper/dynamodb'

const clientResolvers = {
    Query: {},
    Mutation: {
        createKnowledgeRoom: async (
            _,
            { title }: { title: string },
            context: Context,
        ) => {
            try {
                return await insertKnowledeRoom(title, context.userId)
            } catch (e) {
                console.error(e)
            }
        },
    },
}

export default clientResolvers
