import { APIGatewayEvent } from 'aws-lambda'
import { GraphQLError } from 'graphql'

export function authenticateUser(event: APIGatewayEvent): {
    userId: string
} {
    const token =
        event?.headers?.['Authorization'] || event?.headers?.authorization

    if (!token) {
        throw new GraphQLError('Unauthorized: Access denied', {
            extensions: {
                code: 'UNAUTHORIZED',
                http: {
                    status: 401,
                },
            },
        })
    }

    return {
        userId: token,
    }
}
