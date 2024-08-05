import { ApolloServer } from '@apollo/server'
import typeDefs from './graphql/type-defs'
import resolvers from './graphql/resolvers'

export default new ApolloServer({ typeDefs, resolvers })
