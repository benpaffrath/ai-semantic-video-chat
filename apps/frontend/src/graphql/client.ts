import { getUserToken } from '@/helper/userToken'
import { ApolloClient, InMemoryCache } from '@apollo/client'


export const client = new ApolloClient({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_API_URL,
    headers: {
        Authorization: getUserToken(),
    },
    cache: new InMemoryCache(),
})
