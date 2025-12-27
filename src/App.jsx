import { cars } from './data/cars'

function compareAttribute(guess, answer, type = 'equal') {
  if (type === 'equal') {
    return guess === answer ? 'correct' : 'neutral'
  }

  if (type === 'number') {
    if (guess === answer) return 'correct'
    return guess > answer ? 'down' : 'up'
  }

  if (type === 'range') {
    return guess === answer ? 'correct' : 'neutral'
  }

  return 'neutral'
}

const ATTRIBUTES = [
  { key: 'brand', label: 'Marca', type: 'equal' },
  { key: 'type', label: 'Tipo', type: 'equal' },
  { key: 'doors', label: 'Portas', type: 'number' },
  { key: 'engine', label: 'Motor', type: 'number' },
  { key: 'decade', label: 'Década', type: 'number' },
  { key: 'valves', label: 'Válvulas', type: 'number' },
  { key: 'aspiration', label: 'Aspiração', type: 'equal' },
  { key: 'fuel', label: 'Combustível', type: 'equal' },
  { key: 'traction', label: 'Tração', type: 'equal' },
  { key: 'transmission', label: 'Câmbio', type: 'equal' },
  { key: 'priceRange', label: 'Preço', type: 'range' }
]

function App() {
  const answerCar = cars[0]

  const guessedCar = {
    brand: 'BMW',
    model: '320i',
    type: 'sedan',
    doors: 2,
    engine: 1.6,
    decade: 2000,
    valves: 16,
    aspiration: 'turbo',
    fuel: 'flex',
    traction: 'rwd',
    transmission: 'auto',
    priceRange: '200k+'
  }
  const results = ATTRIBUTES.map(attr => {
  const value = guessedCar[attr.key]
  const answer = answerCar[attr.key]

  return {
    key: attr.key,
    label: attr.label,
    value,
    result: compareAttribute(value, answer, attr.type)
  }
})


  return (
    <main style={styles.app}>
      <header style={styles.header}>
        <h1>Car Guess</h1>
        <p>Descubra o carro pelas características</p>
      </header>

      <section style={styles.card}>
  <h2>#1 — {guessedCar.brand} {guessedCar.model}</h2>

  <div style={styles.grid}>
    {results.map(item => (
      <div
        key={item.key}
        style={{
          ...styles.cell,
          backgroundColor:
            item.result === 'correct'
              ? '#4caf50'
              : item.result === 'up' || item.result === 'down'
              ? '#ff9800'
              : '#e0e0e0'
        }}
      >
        <small>{item.label}</small>

<strong style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
  {item.value}
  {item.result === 'up' && <span>↑</span>}
  {item.result === 'down' && <span>↓</span>}
</strong>

      </div>
    ))}
  </div>
</section>

    </main>
  )
}

export default App

const styles = {
  app: {
    minHeight: '100vh',
    padding: '16px',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont',
    background: '#ffffff',
    color: '#000000'
  },
  header: {
    textAlign: 'center',
    marginBottom: '24px'
  },
  card: {
    background: '#f5f5f5',
    borderRadius: '12px',
    padding: '16px',
    maxWidth: '480px',
    margin: '0 auto'
  },
  grid: {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))',
  gap: '8px',
  marginTop: '16px'
  },
  cell: {
    padding: '8px',
    borderRadius: '8px',
    textAlign: 'center',
    color: '#000',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  }
}
