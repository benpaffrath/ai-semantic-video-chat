import { gql } from '@apollo/client'

export const LIST_KNOWLEDGE_ROOMS = gql`
    query listKnowledgeRooms {
        listKnowledgeRooms {
            id
            title
            createdAt
        }
    }
`

export const LIST_CONVERSATIONS = gql`
    query listConversations($knowledgeRoomId: String!) {
        listConversations(knowledgeRoomId: $knowledgeRoomId) {
            id
            title
            createdAt
        }
    }
`

export const LIST_VIDEOS = gql`
    query listVideos($knowledgeRoomId: String!) {
        listVideos(knowledgeRoomId: $knowledgeRoomId) {
            id
            title
            duration
            previewImage
            status
            videoKey
            videoUrl
            type
            createdAt
        }
    }
`
