import { gql } from 'graphql-tag'

// Define your schema
const typeDefs = gql`
  type Query {
    hello: String
  }
`

export default typeDefs
