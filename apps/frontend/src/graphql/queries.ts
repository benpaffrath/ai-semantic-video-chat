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
