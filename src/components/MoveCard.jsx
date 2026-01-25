import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/moveCard.css";
import { favoritesManager } from "../services/api";

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Check if movie is in favorites
    if (movie.id) {
      setIsFavorite(favoritesManager.isFavorite(movie.id));
    }
    // Reset image loading state when movie changes
    setImageLoaded(false);
    setImageError(false);
    // Debug: Log poster path
    console.debug(`Movie: ${movie.Title}, Poster Path: ${movie.Poster}`);
  }, [movie.id, movie.Title, movie.Poster]);

  const handleFavoriteClick = (e) => {
    e.stopPropagation();

    if (isFavorite) {
      // Remove from favorites
      favoritesManager.removeFavorite(movie.id);
      setIsFavorite(false);
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'Removed from favorites', type: 'error' }
      }));
    } else {
      // Add to favorites
      const success = favoritesManager.addFavorite({
        id: movie.id || movie.imdbID,
        imdbID: movie.imdbID,
        Title: movie.Title,
        Year: movie.Year,
        Type: movie.Type,
        Poster: movie.Poster,
        Language: movie.Language,
        Rating: movie.Rating,
        Genre: movie.Genre,
        overview: movie.overview,
        Director: movie.Director,
        Actors: movie.Actors,
        Released: movie.Released
      });

      if (success) {
        setIsFavorite(true);
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { message: 'Added to favorites', type: 'success' }
        }));
      }
    }

    // Dispatch event to update favorites page
    window.dispatchEvent(new Event('favoritesUpdated'));
  };

  const handleMoreInfo = (e) => {
    e.stopPropagation();
    // Navigate to details page
    // Use movie.id or movie.imdbID depending on what's available
    const movieId = movie.id || movie.imdbID;
    navigate(`/movie/${movieId}`);
  };

  const handleImageLoad = () => {
    // Prevent blinking by only setting loaded after successful load
    setImageLoaded(true);
  };

  const handleImageError = (e) => {
    setImageError(true);
    // Use placeholder image from public folder
    e.target.src = '/Images/placeholder.jpg';
  };

  return (
    <div
      className="movie-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleMoreInfo}
    >
      <div className="card-poster">
        {!imageLoaded && !imageError && <div className="image-skeleton"></div>}
        <img
          src={movie.Poster}
          alt={movie.Title}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
          className={imageLoaded ? 'image-loaded' : 'image-loading'}
        />

        <div className="card-actions-overlay">
          <button
            className={`card-btn favorite ${isFavorite ? 'active' : ''}`}
            onClick={handleFavoriteClick}
            title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
          >
            {isFavorite ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            )}
          </button>

          <button
            className="card-btn details"
            onClick={handleMoreInfo}
            title="View Details"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </button>
        </div>
      </div>

      <div className="card-info">
        <div className="card-main-info">
          <h3 className="card-title">{movie.Title}</h3>
          {movie.Rating && movie.Rating !== 'N/A' && (
            <span className="card-rating">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
              {movie.Rating}
            </span>
          )}
        </div>

        <div className="card-secondary-info">
          <span className="card-year">{movie.Year}</span>
          <span className="card-lang">{movie.Language}</span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;