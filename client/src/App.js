import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <div>
              <h1>Welcome to the App</h1>
              <p>Navigate to <a href="/login">/login</a> to see the login page</p>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
