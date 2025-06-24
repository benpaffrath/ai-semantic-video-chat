import { APIGatewayEvent } from 'aws-lambda'
import { GraphQLError } from 'graphql'

// This is not a real authentication function and should only indicate it.
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
