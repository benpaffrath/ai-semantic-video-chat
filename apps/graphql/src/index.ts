import { createYoga } from 'graphql-yoga'
import { createServer } from 'node:http'
import schema from './schema'
import { context } from './context'
import dotenv from 'dotenv'
import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda'

dotenv.config()

// GraphQL Yoga server configuration with custom context
const yoga = createYoga({
    graphqlEndpoint: '/graphql',
    schema,
    context,
})

/**
 * AWS Lambda handler that adapts API Gateway events to GraphQL Yoga
 * Converts API Gateway request format to standard HTTP request for Yoga
 */
export async function handler(
    event: APIGatewayEvent,
    lambdaContext: Context,
): Promise<APIGatewayProxyResult> {
    // Convert API Gateway path to full URL for Yoga fetch
    const url = new URL(
        event.path,
        `https://${event.headers.Host || 'localhost'}`,
    )

    const response = await yoga.fetch(
        url,
        {
            method: event.httpMethod,
            headers: event.headers as HeadersInit,
            body: event.body
                ? Buffer.from(
                      event.body,
                      event.isBase64Encoded ? 'base64' : 'utf8',
                  )
                : undefined,
        },
        {
            event,
            lambdaContext,
        },
    )

    // Convert Yoga response back to API Gateway format
    const responseHeaders = Object.fromEntries(response.headers.entries())

    return {
        statusCode: response.status,
        headers: responseHeaders,
        body: await response.text(),
        isBase64Encoded: false,
    }
}

/**
 * Local development server setup
 * Only runs when IS_LOCAL environment variable is set
 */
if (process.env.IS_LOCAL) {
    const server = createServer(yoga)

    server.listen(4000, () => {
        console.log(`
      🚀 Server ready at: http://localhost:4000
      ⭐️ See sample queries: http://pris.ly/e/ts/graphql-sdl-first#using-the-graphql-api`)
    })
}
