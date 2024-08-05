import React from 'react'
import * as ReactDOMClient from 'react-dom/client'
import { ApolloProvider } from '@apollo/client'
import createApolloClient from './create-apollo-client'

// lazy load App
const App = React.lazy(() => import('../shared/app'))

const initialState = window.__APOLLO_STATE__
const client = createApolloClient(initialState, undefined)

const container = document.getElementById('root')
if (!container) {
  throw new Error('root not found')
}
const root = ReactDOMClient.createRoot(container) // create a root

// render/hydrate root
root.render(
  <ApolloProvider client={client}>
    <React.Suspense fallback={<div>Loading...</div>}>
      <App />
    </React.Suspense>
  </ApolloProvider>
)