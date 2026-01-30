import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Login from './pages/Login'
import './App.css'

function Home() {
  return (
    <div className="App">
      <h1>Welcome</h1>
      <p>
        Go to the <Link to="/login">Login</Link> page.
      </p>
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  )
}

export default App
