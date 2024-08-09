import React from 'react'
import * as styles from './app.module.css'

const App = () => {
  return (
    <div className={styles.body}>
      <header className={styles.header}>
        <h1>SSR React Apollo App</h1>
        <link rel="stylesheet" type="text/css" href="/styles.css"></link>
      </header>

      <div className={styles.content}>
      </div>

      <footer className={styles.footer}>
        <p>Footer</p>
      </footer>

    </div>
  )
}

export default App