import { GraphQLError } from 'graphql'
import { APIGatewayEvent } from 'aws-lambda'
import { authenticateUser } from './auth'

export interface Context {
    userId: string
}

export const context = ({
    event,
    req,
}: {
    event: APIGatewayEvent
}): Context => {
    return authenticateUser(event || req)
}
