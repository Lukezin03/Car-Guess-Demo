function App() {
  return (
    <main style={styles.app}>
      <header style={styles.header}>
        <h1>Car Guess</h1>
        <p>Descubra o carro pelas características</p>
      </header>

      <section style={styles.game}>
        <p>Demo em desenvolvimento 🚧</p>
        <p>Primeiro modo: adivinhar o carro</p>
      </section>
    </main>
  )
}

export default App

const styles = {
  app: {
    minHeight: '100vh',
    padding: '16px',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont'
  },
  header: {
    textAlign: 'center',
    marginBottom: '24px'
  },
  game: {
    background: '#f5f5f5',
    borderRadius: '12px',
    padding: '16px'
  }
}
