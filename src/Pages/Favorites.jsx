import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/NavBar';
import MovieCard from '../components/MoveCard';
import "../css/favorites.css";
import { favoritesManager } from '../services/api';

const Favorite = ({ theme, toggleTheme }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadFavorites();

    // Listen for favorites updates
    const handleStorageChange = () => {
      loadFavorites();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('favoritesUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('favoritesUpdated', handleStorageChange);
    };
  }, []);

  const loadFavorites = () => {
    setLoading(true);
    const favs = favoritesManager.getFavorites();
    setFavorites(favs);
    setLoading(false);
  };

  const clearFavorites = () => {
    if (window.confirm('Are you sure you want to clear all favorites?')) {
      favoritesManager.clearFavorites();
      loadFavorites();
    }
  };

  const getUniqueGenres = () => {
    const genres = new Set();
    favorites.forEach(movie => {
      if (movie.Genre && movie.Genre !== 'N/A') {
        movie.Genre.split(', ').forEach(genre => genres.add(genre));
      }
    });
    return ['All', ...Array.from(genres)];
  };

  const filteredFavorites = favorites.filter(movie => {
    const matchesSearch = searchTerm === '' ||
      movie.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (movie.Genre && movie.Genre.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesGenre = selectedGenre === 'All' ||
      (movie.Genre && movie.Genre.includes(selectedGenre));

    return matchesSearch && matchesGenre;
  });

  return (
    <div className={`favorites-container ${theme}`}>
      <Navbar theme={theme} toggleTheme={toggleTheme} />

      <main className="favorites-content">
        <div className="favorites-header">
          <div className="header-background">
            <h1>My Favorites</h1>
            <p>Your personalized collection of cherished movies</p>
          </div>

          <div className="filters-section">
            <div className="search-filter">
              <input
                type="text"
                placeholder="Search in favorites..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="favorites-search-input"
              />
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
            </div>

            <div className="genre-filters">
              {getUniqueGenres().map(genre => (
                <button
                  key={genre}
                  className={`genre-filter-btn ${selectedGenre === genre ? 'active' : ''}`}
                  onClick={() => setSelectedGenre(genre)}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          <div className="favorites-actions">
            <button
              className="go-home-btn"
              onClick={() => navigate('/')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
              Back to Home
            </button>

            {favorites.length > 0 && (
              <>
                <button
                  className="clear-favorites-btn"
                  onClick={clearFavorites}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                  Clear All
                </button>
                <span className="favorites-count">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  {favorites.length} {favorites.length === 1 ? 'movie' : 'movies'}
                </span>
              </>
            )}
          </div>
        </div>

        {loading ? (
          <div className="loading-favorites">
            <div className="spinner"></div>
            <p>Loading your favorites...</p>
          </div>
        ) : filteredFavorites.length > 0 ? (
          <>
            <div className="favorites-stats">
              <div className="stat-card">
                <h3>Total Movies</h3>
                <p className="stat-number">{favorites.length}</p>
              </div>
              <div className="stat-card">
                <h3>Showing</h3>
                <p className="stat-number">{filteredFavorites.length}</p>
              </div>
              <div className="stat-card">
                <h3>Languages</h3>
                <p className="stat-number">
                  {new Set(favorites.map(m => m.Language || 'Unknown')).size}
                </p>
              </div>
            </div>

            <div className="favorites-grid">
              {filteredFavorites.map(movie => (
                <div key={movie.id} className="favorite-movie-item">
                  <div className="favorite-card">
                    <MovieCard movie={movie} />
                    <div className="favorite-actions">
                      <button
                        className="remove-favorite-btn"
                        onClick={() => {
                          favoritesManager.removeFavorite(movie.id);
                          loadFavorites();
                          window.dispatchEvent(new Event('favoritesUpdated'));
                          window.dispatchEvent(new CustomEvent('show-toast', {
                            detail: { message: 'Removed from favorites', type: 'error' }
                          }));
                        }}
                        title="Remove from favorites"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                        </svg>
                        Remove
                      </button>
                      <button
                        className="view-details-btn"
                        onClick={() => navigate(`/movie/${movie.id}`)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="empty-favorites">
            <div className="empty-icon">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <h2>No favorites yet</h2>
            <p>Start adding movies to your favorites by clicking the heart icon on movie cards</p>
            <div className="empty-favorites-actions">
              <button onClick={() => navigate('/')} className="primary-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Browse Movies
              </button>
              <button className="secondary-btn" onClick={() => navigate('/')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                </svg>
                Go Back to Home
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Favorite;