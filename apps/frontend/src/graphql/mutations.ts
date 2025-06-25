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
