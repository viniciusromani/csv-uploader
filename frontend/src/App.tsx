import { Button } from './components/ui/button'

function App() {
  return (
    <>
      <h1>Vite + React</h1>
      <div>Hello World</div>
      <div>{ process.env.API_URL }</div>
      <Button>Click me!</Button>
    </>
  )
}

export default App
