import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <p className="text-red-600 bg-blue-500">
        Hello world!
      </p>
      <button onClick={() => setCount((count) => count + 1)}>
        count is {count}
      </button>
    </>
  )
}

export default App
