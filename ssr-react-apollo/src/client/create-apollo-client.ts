import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client'
import fetch from 'cross-fetch'
import { Request } from 'express'

const createApolloClient = (initialState: any = {}, request: Request | undefined) => {
  // Create a new HttpLink for each server-side request. Pass headers from the
  // context to the link for things like cookies (if using authentication based on cookies)
  const ssrMode = Boolean(request)
  const headers = request && request.headers ? request.headers : {}
  const link = new HttpLink({
    uri: `${process.env.PUBLIC_EXPRESS_URI}${process.env.PUBLIC_GRAPHQL_PATH}`, // Adjust this to your GraphQL server URI
    fetch,
    // HttpLink doesn't accept undefined or string[] for headers, so coalesce to Record,string, string>
    headers: Object.keys(headers).reduce((acc, key) => {
      const value = headers[key]
      if (value !== undefined) {  // Check if the value is not undefined
          if (Array.isArray(value)) {
            acc[key] = value.join(',')
          } else {
            acc[key] = value // Add to accumulator if value is a string
          }
      }
      return acc
  }, {} as Record<string, string>),
  })

  // The cache's initial state is rehydrated from the server-side rendering or starts empty
  const cache = new InMemoryCache().restore(initialState)

  return new ApolloClient({
    ssrMode,
    link,
    cache
  })
}

export default createApolloClient
