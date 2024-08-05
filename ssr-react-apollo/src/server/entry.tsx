import express, { Application, Request, Response } from 'express'
import React from 'react'
import dotenv from 'dotenv'
import ReactDOMServer from 'react-dom/server'
import server from './create-apollo-server'
import { ApolloProvider } from '@apollo/client/react'
import { getDataFromTree } from '@apollo/client/react/ssr'
import createApolloClient from '../client/create-apollo-client'
import { expressMiddleware } from '@apollo/server/express4'
import App from '../shared/app'

dotenv.config()
const app: Application = express()

const startServer = async () => {
  if (process.env.PUBLIC_GRAPHQL_PATH === undefined) {
    throw new Error('Environment variable PUBLIC_GRAPHQL_PATH not defined')
  }
  if (process.env.PUBLIC_EXPRESS_URI === undefined) {
    throw new Error('Environment variable PUBLIC_EXPRESS_URI not defined')
  }
  if (process.env.PORT === undefined) {
    throw new Error('Environment variable PORT not defined')
  }

  try {
    await server.start();
    app.use(express.json()); // Parse JSON bodies
    app.use(process.env.PUBLIC_GRAPHQL_PATH, expressMiddleware(server));

    // Serve static files (if necessary for your client app)
    app.use(express.static('dist'))

    // Other routes or middleware
    app.get('/*', async (req: Request, res: Response) => {
      req
      const client = createApolloClient({}, req)

      const AppWithProvider = (
        <ApolloProvider client={client}>
          <App />
        </ApolloProvider>
      )

      try {
        // Wait for all queries to be fetched
        await getDataFromTree(AppWithProvider)

        // Render the component to a string
        const content = ReactDOMServer.renderToString(AppWithProvider)

        // Extract the initial state from the Apollo store
        const initialState = client.extract()

        const html = `
          <html>
            <head>
              <title>SSR React App</title>
            </head>
            <body>
              <div id="root">${content}</div>
              <script>
                window.__APOLLO_STATE__ = ${JSON.stringify(initialState).replace(/</g, '\\u003c')}
              </script>
              <script src="client.bundle.js"></script>
            </body>
          </html>
        `

        res.send(html)
      } catch(e) {
        console.error('Error during server-side rendering:', e)
        res.status(500).send("Internal Server Error")
      }
    })

    // Start the express server
    app.listen(process.env.PORT, () => {
      console.log(`Express server is running on ${process.env.PUBLIC_EXPRESS_URI}`)
      console.log(`Apollo Server is running on ${process.env.PUBLIC_EXPRESS_URI}${process.env.PUBLIC_GRAPHQL_PATH}`)
    })
  } catch(e) {
    console.log(e)
  }
}

startServer()