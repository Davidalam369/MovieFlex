import { useState, useRef, useEffect } from 'react';
import MovieCard from './MoveCard';
import '../css/moviesection.css';

const MovieSection = ({ 
  title, 
  movies, 
  showLanguageFilter = false, 
  showYearFilter = false,
  languages = [], 
  yearRanges = [],
  autoSlide = false,
  onLanguageFilter,
  onYearRangeChange
}) => {
  const [filteredMovies, setFilteredMovies] = useState(movies);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedYearRange, setSelectedYearRange] = useState(yearRanges[0]);
  const containerRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 7; // 7 movies per column as requested
  const totalPages = Math.ceil(filteredMovies.length / itemsPerPage);

  // Update filtered movies when movies prop changes
  useEffect(() => {
    setFilteredMovies(movies);
    setCurrentPage(0);
  }, [movies]);

  // Auto-slide functionality
  useEffect(() => {
    if (!autoSlide || totalPages <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentPage(prev => {
        const nextPage = (prev + 1) % totalPages;
        if (containerRef.current) {
          containerRef.current.scrollTo({
            left: nextPage * containerRef.current.offsetWidth,
            behavior: 'smooth'
          });
        }
        return nextPage;
      });
    }, 5000); // 5 seconds

    return () => clearInterval(interval);
  }, [autoSlide, totalPages]);

  const scrollLeft = () => {
    if (containerRef.current) {
      const newPage = Math.max(0, currentPage - 1);
      containerRef.current.scrollTo({
        left: newPage * containerRef.current.offsetWidth,
        behavior: 'smooth'
      });
      setCurrentPage(newPage);
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      const newPage = Math.min(totalPages - 1, currentPage + 1);
      containerRef.current.scrollTo({
        left: newPage * containerRef.current.offsetWidth,
        behavior: 'smooth'
      });
      setCurrentPage(newPage);
    }
  };

  const handleWheelScroll = (e) => {
    if (containerRef.current && Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
      e.preventDefault();
      containerRef.current.scrollBy({
        left: e.deltaY * 2,
        behavior: 'smooth'
      });
      
      // Update page based on scroll position
      setTimeout(() => {
        if (containerRef.current) {
          const scrollPos = containerRef.current.scrollLeft;
          const pageWidth = containerRef.current.offsetWidth;
          const newPage = Math.round(scrollPos / pageWidth);
          setCurrentPage(Math.max(0, Math.min(totalPages - 1, newPage)));
        }
      }, 100);
    }
  };

  const handleLanguageChange = (e) => {
    const language = e.target.value;
    setSelectedLanguage(language);
    if (onLanguageFilter) {
      onLanguageFilter(language);
    }
  };

  const handleYearRangeClick = (range) => {
    setSelectedYearRange(range);
    if (onYearRangeChange) {
      onYearRangeChange(range);
    }
  };

  return (
    <section className="movie-section">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        
        <div className="filter-group">
          {showLanguageFilter && languages.length > 0 && (
            <div className="filter-container">
              <select 
                value={selectedLanguage} 
                onChange={handleLanguageChange}
                className="language-filter"
              >
                <option value="">All Languages</option>
                {languages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
          )}

          {showYearFilter && yearRanges.length > 0 && (
            <div className="year-filter-container">
              {yearRanges.map(range => (
                <button
                  key={range.label}
                  className={`year-filter-btn ${selectedYearRange?.label === range.label ? 'active' : ''}`}
                  onClick={() => handleYearRangeClick(range)}
                >
                  {range.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="section-content">
        <button 
          className={`nav-arrow left-arrow ${currentPage === 0 ? 'disabled' : ''}`}
          onClick={scrollLeft}
          disabled={currentPage === 0}
          aria-label="Scroll left"
        >
          ‹
        </button>
        
        <div 
          ref={containerRef}
          className="movies-container"
          onWheel={handleWheelScroll}
        >
          {filteredMovies.length > 0 ? (
            filteredMovies.map((movie, index) => (
              <MovieCard 
                key={`${movie.id || movie.imdbID}-${index}`} 
                movie={movie} 
              />
            ))
          ) : (
            <div className="no-movies">
              <p>No movies found for the selected filters.</p>
            </div>
          )}
        </div>
        
        <button 
          className={`nav-arrow right-arrow ${currentPage >= totalPages - 1 ? 'disabled' : ''}`}
          onClick={scrollRight}
          disabled={currentPage >= totalPages - 1}
          aria-label="Scroll right"
        >
          ›
        </button>
      </div>
      
      {totalPages > 1 && (
        <div className="page-indicator">
          {Array.from({ length: totalPages }).map((_, index) => (
            <div 
              key={index}
              className={`page-dot ${index === currentPage ? 'active' : ''}`}
              onClick={() => {
                if (containerRef.current) {
                  containerRef.current.scrollTo({
                    left: index * containerRef.current.offsetWidth,
                    behavior: 'smooth'
                  });
                  setCurrentPage(index);
                }
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default MovieSection;