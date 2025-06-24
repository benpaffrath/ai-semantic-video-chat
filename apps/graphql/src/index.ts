import { createYoga } from 'graphql-yoga'
import { createServer } from 'node:http'
import schema from './schema'
import dotenv from 'dotenv'
import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda'

dotenv.config()

const yoga = createYoga({
    graphqlEndpoint: '/graphql',
    schema,
})

export async function handler(
    event: APIGatewayEvent,
    lambdaContext: Context,
): Promise<APIGatewayProxyResult> {
    const response = await yoga.fetch(
        event.path,
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

    const responseHeaders = Object.fromEntries(response.headers.entries())

    return {
        statusCode: response.status,
        headers: responseHeaders,
        body: await response.text(),
        isBase64Encoded: false,
    }
}

// Check if the code is running in a local environment
if (process.env.IS_LOCAL) {
    const server = createServer(yoga)

    server.listen(4000, () => {
        console.log(`
      🚀 Server ready at: http://localhost:4000
      ⭐️ See sample queries: http://pris.ly/e/ts/graphql-sdl-first#using-the-graphql-api`)
    })
}