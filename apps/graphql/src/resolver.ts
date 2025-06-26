import { Context } from './context'
import {
    insertConversation,
    insertKnowledgeRoom,
    insertVideo,
    listConversationsByKnowledgeRoom,
    listKnowledgeRoomsByUserId,
    listVideosByKnowledgeRoom,
} from './helper/dynamodb'
import { generatePresignedUploadUrl, generatePresignedUrl } from './helper/s3'
import { sendVideoEventToSQS } from './helper/sqs'

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
        listVideos: async (
            _,
            { knowledgeRoomId }: { knowledgeRoomId: string },
            context: Context,
        ) => {
            try {
                const videos = await listVideosByKnowledgeRoom(
                    knowledgeRoomId,
                    context.userId,
                )

                return await Promise.all(
                    videos.map(async (video) => {
                        const videoUrl = await generatePresignedUrl(
                            `${context.userId}/${video.videoKey}`,
                        )
                        return {
                            ...video,
                            videoUrl,
                        }
                    }),
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
        createUploadUrls: async (_, { input }, context: Context) => {
            const promises = input.map(
                (i: {
                    fileName: string
                    fileType: string
                    id: string
                    key: string
                }) => ({
                    promise: generatePresignedUploadUrl(
                        `${context.userId}/${i.key || i.fileName}`,
                        i.fileType,
                        {
                            createdBy: context.userId,
                            updatedBy: context.userId,
                        },
                    ),
                    fileName: i.fileName,
                    fileType: i.fileType,
                    key: `${i.key || i.fileName}`,
                    id: i.id,
                }),
            )

            const resolvedUploadUrls = await Promise.all(
                promises.map((p) => p.promise),
            )

            return resolvedUploadUrls.map((url, index) => ({
                uploadUrl: url,
                fileName: promises[index].fileName,
                fileType: promises[index].fileType,
                key: promises[index].key,
                id: promises[index].id,
            }))
        },
        createVideo: async (
            _,
            { input, knowledgeRoomId },
            context: Context,
        ) => {
            try {
                const video = await insertVideo(
                    input.id,
                    input.title,
                    input.duration,
                    input.previewImage,
                    input.videoKey,
                    input.type,
                    knowledgeRoomId,
                    context.userId,
                )

                const messageId = await sendVideoEventToSQS(
                    video,
                    knowledgeRoomId,
                    context.userId,
                )

                console.log('Message ID', messageId)

                return video
            } catch (e) {
                console.error(e)
            }
        },
    },
}

export default clientResolvers
