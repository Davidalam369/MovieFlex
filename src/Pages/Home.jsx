import { useState, useEffect } from 'react';
import Navbar from '../components/NavBar';
import MovieSection from '../components/MovieSection';
import {
  searchMovies,
  getTrendingMoviesByLanguage,
  getRecentMoviesByLanguage,
  LANGUAGES,
  LANGUAGE_VALUES
} from '../services/api';
import '../css/Home.css';

const Home = ({ theme, toggleTheme }) => {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [recentMovies, setRecentMovies] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [loading, setLoading] = useState({
    trending: false,
    recent: false,
    search: false
  });

  const [error, setError] = useState('');

  // Trending Section Filter State
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return localStorage.getItem('selectedLanguage') || 'English';
  });
  // Year filter removed as per request

  // Recent Section Filter State
  const [recentLanguage, setRecentLanguage] = useState(() => {
    return localStorage.getItem('recentLanguage') || 'Malayalam';
  });

  // Fetch initial data
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Fetch trending movies when language changes
  useEffect(() => {
    if (!isSearching) {
      localStorage.setItem('selectedLanguage', selectedLanguage);
      fetchTrendingMovies();
    }
  }, [selectedLanguage]);

  // Fetch recent movies when its language changes
  useEffect(() => {
    if (!isSearching) {
      localStorage.setItem('recentLanguage', recentLanguage);
      fetchRecentMovies();
    }
  }, [recentLanguage]);

  const fetchInitialData = async () => {
    setLoading({ trending: true, recent: true, search: false });
    setError('');

    // Initial fetch for both sections
    await Promise.all([
      fetchTrendingMovies(),
      fetchRecentMovies()
    ]);
  };

  const fetchTrendingMovies = async () => {
    setLoading(prev => ({ ...prev, trending: true }));
    try {
      // Default to 2026 or current year since filter is removed
      const movies = await getTrendingMoviesByLanguage(selectedLanguage, 2026);
      setTrendingMovies(movies);
    } catch (error) {
      console.error('Error fetching trending movies:', error);
    }
    setLoading(prev => ({ ...prev, trending: false }));
  };

  const fetchRecentMovies = async () => {
    setLoading(prev => ({ ...prev, recent: true }));
    try {
      // Use the generalized function with the selected language for the second section
      console.log(`Fetching recent ${recentLanguage} movies...`);
      const movies = await getRecentMoviesByLanguage(recentLanguage);
      setRecentMovies(movies);
    } catch (error) {
      console.error('Error fetching recent movies:', error);
    }
    setLoading(prev => ({ ...prev, recent: false }));
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setSearchQuery(query);
    setError('');
    setLoading(prev => ({ ...prev, search: true }));

    try {
      const results = await searchMovies(query);
      setSearchResults(results);

      if (results.length === 0) {
        setError(`No results found for "${query}". Try a different search term.`);
      }
    } catch (error) {
      console.error('Error searching movies:', error);
      setSearchResults([]);
      setError('Search failed. Please check your connection and try again.');
    } finally {
      setLoading(prev => ({ ...prev, search: false }));
    }
  };

  const clearSearch = () => {
    setIsSearching(false);
    setSearchQuery('');
    setSearchResults([]);
    setError('');
    // No need to refetch initial data as existing state is preserved, just exit search mode
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  const handleRecentLanguageChange = (language) => {
    setRecentLanguage(language);
  };

  return (
    <div className={`home-container ${theme}`}>
      <Navbar theme={theme} toggleTheme={toggleTheme} />

      {/* Hero Search Section */}
      <div className="hero-search-section">
        <div className="hero-background">
          {/* Background can be added here */}
        </div>

        <div className="search-container">
          <div className="search-box">
            <h2>Discover Your Next Favorite Movie</h2>
            <p>Search across thousands of movies with complete details</p>

            <form onSubmit={(e) => { e.preventDefault(); handleSearch(searchQuery); }}>
              <div className="search-input-wrapper">
                <input
                  type="text"
                  placeholder="Search movies by title ... ....."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                  disabled={loading.search}
                />
                <button
                  type="submit"
                  className="search-button"
                  disabled={loading.search || !searchQuery.trim()}
                >
                  {loading.search ? (
                    <div className="search-spinner"></div>
                  ) : (
                    <>
                      <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                      </svg>
                      Search
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="section-spacer"></div>
      </div>

      <main className="main-content">
        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button className="error-close" onClick={() => setError('')}>×</button>
          </div>
        )}

        {isSearching ? (
          <div className="search-results-section">
            <div className="search-header">
              <h2>Search Results for "{searchQuery}"</h2>
              <button className="clear-search" onClick={clearSearch}>
                Clear Search
              </button>
            </div>

            {loading.search ? (
              <div className="loading-results">
                <div className="spinner"></div>
                <p>Searching movies...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <>
                <p className="results-count">{searchResults.length} movies found</p>
                <div className="results-grid">
                  {searchResults.map(movie => (
                    <div key={movie.id} className="search-movie-card">
                      <div className="movie-poster-container">
                        <img
                          src={movie.Poster}
                          alt={movie.Title}
                          onError={(e) => {
                            if (!e.target.dataset.attempted) {
                              e.target.dataset.attempted = 'true';
                              e.target.src = '/Images/placeholder.jpg';
                            }
                          }}
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                      <div className="search-movie-info">
                        <h3>{movie.Title}</h3>
                        <div className="movie-meta">
                          <span className="movie-year">{movie.Year}</span>
                          <span className="movie-type">{movie.Type}</span>
                          {movie.Rating && movie.Rating !== 'N/A' && (
                            <span className="movie-rating">⭐ {movie.Rating}</span>
                          )}
                        </div>
                        {movie.Genre && movie.Genre !== 'N/A' && (
                          <p className="movie-genre">{movie.Genre}</p>
                        )}
                        {movie.overview && (
                          <p className="movie-overview">{movie.overview.substring(0, 100)}...</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="no-results">
                <p>No movies found for "{searchQuery}"</p>
                <button className="back-button" onClick={clearSearch}>
                  Back to Home
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Trending Movies Section with Language Filter */}
            <div className="section-with-loading">
              {loading.trending && (
                <div className="loading-overlay">
                  <div className="spinner"></div>
                  <p>Loading Trending Movies...</p>
                </div>
              )}

              {!loading.trending && (
                <>
                  <div className="section-header-enhanced">
                    <div>
                      <h2 className="section-main-title">Trending English Movies</h2>
                      <p className="section-subtitle">Upcoming and popular releases</p>
                    </div>

                  
                  </div>

                  <MovieSection
                    title=""
                    movies={trendingMovies}
                    autoSlide={true}
                  />
                </>
              )}
            </div>

            {/* Recent Movies Section with Language Filter */}
            <div className="section-with-loading">
              {loading.recent && (
                <div className="loading-overlay">
                  <div className="spinner"></div>
                  <p>Loading Recent Movies...</p>
                </div>
              )}

              {!loading.recent && (
                <>
                  <div className="section-header-enhanced">
                    <div>
                      <h2 className="section-main-title">Recent {recentLanguage} Movies</h2>
                      <p className="section-subtitle">Latest releases in {recentLanguage} cinema</p>
                    </div>

                    <div className="filter-controls">
                      <div className="filter-group">
                        <label htmlFor="recent-language-filter">Language:</label>
                        <select
                          id="recent-language-filter"
                          value={recentLanguage}
                          onChange={(e) => handleRecentLanguageChange(e.target.value)}
                          className="language-select"
                        >
                          {LANGUAGE_VALUES.map(lang => (
                            <option key={lang} value={lang}>{lang}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <MovieSection
                    title=""
                    movies={recentMovies}
                    autoSlide={true}
                  />
                </>
              )}
            </div>
          </>
        )}
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <h2>Movie<span className="logo-highlight">Flex</span></h2>
            <p>© 2026 MovieFlex. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;