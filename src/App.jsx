import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Favorite from './pages/Favorites'
import MovieDetails from './pages/MovieDetails'
import Toast from './components/Toast'
import "./css/app.css"
function App() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'dark';
  });

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <div className={`app ${theme}`}>
      <Toast />
      <Router>
        <Routes>
          <Route
            path="/"
            element={<Home theme={theme} toggleTheme={toggleTheme} />}
          />
          <Route
            path="/favorites"
            element={<Favorite theme={theme} toggleTheme={toggleTheme} />}
          />
          <Route

            path="/movie/:id"
            element={<MovieDetails theme={theme} toggleTheme={toggleTheme} />}
          />
        </Routes>
      </Router>
    </div>
  );
}



export default App;