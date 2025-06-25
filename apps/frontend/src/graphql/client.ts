import { getUserToken } from '@/helper/userToken'
import { ApolloClient, InMemoryCache } from '@apollo/client'


export const client = new ApolloClient({
    // uri: 'https://ps73xc95yk.execute-api.eu-central-1.amazonaws.com/dev/graphql',
    uri: process.env.NEXT_PUBLIC_GRAPHQL_API_URL,
    headers: {
        Authorization: getUserToken(),
    },
    cache: new InMemoryCache(),
})
