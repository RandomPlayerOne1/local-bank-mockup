import Landing from "./pages/landing"
import { Navigate } from "react-router-dom"

function App() {
  return (
    <div className='bg-background'>
      <Navigate to="/home" replace />
    </div>
  )
}

export default App
