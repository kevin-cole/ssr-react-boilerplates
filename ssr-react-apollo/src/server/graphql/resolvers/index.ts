// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    hello: () => {
      return 'Hello world!'
    },
  },
}

export default resolvers
