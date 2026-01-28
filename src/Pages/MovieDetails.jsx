import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/NavBar';
import { getMovieById, favoritesManager } from '../services/api';
import '../css/moviedetails.css';

const MovieDetails = ({ theme, toggleTheme }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const data = await getMovieById(id);
                if (data) {
                    setMovie(data);
                    setIsFavorite(
                        favoritesManager.isFavorite(data.id || data.imdbID)
                    );
                }
            } catch (error) {
                console.error('Failed to fetch movie details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [id]);

    const handleFavoriteClick = () => {
        if (!movie) return;

        if (isFavorite) {
            favoritesManager.removeFavorite(movie.id || movie.imdbID);
            setIsFavorite(false);
            window.dispatchEvent(
                new CustomEvent('show-toast', {
                    detail: { message: 'Removed from favorites', type: 'error' }
                })
            );
        } else {
            favoritesManager.addFavorite(movie);
            setIsFavorite(true);
            window.dispatchEvent(
                new CustomEvent('show-toast', {
                    detail: { message: 'Added to favorites', type: 'success' }
                })
            );
        }
    };

    const handleBack = () => navigate(-1);

    if (loading) {
        return (
            <div className={`app ${theme}`}>
                <Navbar theme={theme} toggleTheme={toggleTheme} />
                <div className="loading-overlay full-screen">
                    <div className="spinner"></div>
                    <p>Loading Movie Details...</p>
                </div>
            </div>
        );
    }

    if (!movie) {
        return (
            <div className={`app ${theme}`}>
                <Navbar theme={theme} toggleTheme={toggleTheme} />
                <div
                    className="container"
                    style={{ paddingTop: '100px', textAlign: 'center' }}
                >
                    <h2>Movie not found</h2>
                    <button
                        className="primary-button"
                        onClick={() => navigate('/')}
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`app ${theme}`}>
            <Navbar theme={theme} toggleTheme={toggleTheme} />

            <div className="movie-details-container">
                <button onClick={handleBack} className="back-btn">
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <line x1="19" y1="12" x2="5" y2="12" />
                        <polyline points="12 19 5 12 12 5" />
                    </svg>
                    Back
                </button>

                <div className="movie-hero">
                    <div className="movie-hero-backdrop">
                        <img src={movie.Poster} alt={`${movie.Title} Backdrop`} />
                    </div>

                    <div className="movie-content-wrapper">
                        <div className="movie-poster-large">
                            <img src={movie.Poster} alt={movie.Title} />
                        </div>

                        <div className="movie-info-header">
                            <h1 className="movie-title-large">
                                {movie.Title}
                            </h1>

                            <div className="movie-meta-large">
                                <span className="movie-year">
                                    {movie.Year}
                                </span>

                                <span className="meta-separator"></span>
                                <div className="movie-rating-large">
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                    </svg>
                                    <span>{movie.Rating}</span>
                                </div>
                            </div>

                            <div className="action-buttons">
                                <button
                                    className={`fav-btn-large ${isFavorite ? 'active' : ''
                                        }`}
                                    onClick={handleFavoriteClick}
                                >
                                    {isFavorite ? 'Saved to Favorites' : 'Add to Favorites'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="details-grid">
                    <div className="plot-section">
                        <h3>Story</h3>

                        {/* ✅ MAIN DESCRIPTION (2 PARAGRAPHS) */}
                        <p className="plot-text">
                            {movie.overview}
                        </p>

                        {/* ✅ OPTIONAL SHORT OVERVIEW */}
                        {movie.description && movie.overview && (
                            <>
                                <h3>Short Overview</h3>
                                <p className="plot-text">{movie.overview}</p>
                            </>
                        )}

                        <h3>Cast & Crew</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">Director</span>
                                <span className="info-value">
                                    {movie.Director || 'N/A'}
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Cast</span>
                                <span className="info-value">
                                    {movie.Actors || 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="meta-sidebar">
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">Genre</span>
                                <span className="info-value">
                                    {movie.Genre}
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Language</span>
                                <span className="info-value">
                                    {movie.Language}
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Released</span>
                                <span className="info-value">
                                    {movie.Released || movie.Year}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MovieDetails;
