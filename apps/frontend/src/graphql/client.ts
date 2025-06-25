import { getUserToken } from '@/helper/userToken'
import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client'

export const client = new ApolloClient({
    // uri: 'https://ps73xc95yk.execute-api.eu-central-1.amazonaws.com/dev/graphql',
    uri: 'http://localhost:4000/graphql',
    headers: {
        Authorization: getUserToken(),
    },
    cache: new InMemoryCache(),
})
