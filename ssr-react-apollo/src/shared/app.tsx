import React from 'react'
import { useQuery, gql } from '@apollo/client'

const HELLO_QUERY = gql`
  query {
    hello
  }
`

const Hello = () => {
  const { data, loading, error } = useQuery(HELLO_QUERY)

  if (loading) return <p>Loading app</p>
  if (error) return <p>Error in  useQuery</p>

  return <div>{data.hello}</div>
}

const App = () => {
  return (
    <div>
      <h1>SSR Apollo React App</h1>
      <Hello />
    </div>
  )
}

export default App