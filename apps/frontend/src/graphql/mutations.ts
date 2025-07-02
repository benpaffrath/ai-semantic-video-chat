import { gql } from '@apollo/client'

export const CREATE_KNOWLEDGE_ROOM = gql`
    mutation createKnowledgeRoom($title: String!) {
        createKnowledgeRoom(title: $title) {
            id
            title
            createdAt
        }
    }
`

export const CREATE_CONVERSATION = gql`
    mutation createConversation($title: String!, $knowledgeRoomId: String!) {
        createConversation(title: $title, knowledgeRoomId: $knowledgeRoomId) {
            id
            title
            createdAt
        }
    }
`

export const CREATE_UPLOAD_URLS = gql`
    mutation createUploadUrls($input: [CreateUploadUrlInput!]!) {
        createUploadUrls(input: $input) {
            id
            uploadUrl
        }
    }
`

export const CREATE_VIDEO = gql`
    mutation createVideo($input: CreateVideoInput!, $knowledgeRoomId: String!) {
        createVideo(input: $input, knowledgeRoomId: $knowledgeRoomId) {
            id
            title
            videoKey
            videoUrl
            duration
            previewImage
            type
            status
            createdAt
        }
    }
`

export const SEND_CHAT_MESSAGE = gql`
    mutation sendChatMessage(
        $input: SendChatMessageInput!
        $knowledgeRoomId: String!
        $conversationId: String!
    ) {
        sendChatMessage(
            input: $input
            knowledgeRoomId: $knowledgeRoomId
            conversationId: $conversationId
        ) {
            id
            content
            isUserMessage
            relatedDocuments {
                videoId
                start
                end
            }
            createdAt
        }
    }
`
