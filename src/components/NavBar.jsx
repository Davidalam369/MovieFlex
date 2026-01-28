import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Navbar.css";

const Navbar = ({ theme, toggleTheme }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  const handleScroll = () => {
    const currentScrollY = window.scrollY;

    setIsScrolled(currentScrollY > 100);

    if (currentScrollY > lastScrollY && currentScrollY > 120) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }

    setLastScrollY(currentScrollY);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <nav
      className={`navbar ${isVisible ? "visible" : "hidden"} ${
        isScrolled ? "scrolled" : ""
      }`}
    >
      {/* 🎞️ Film Strip Line */}
      <div className="navbar-film-strip"></div>

      <div className="navbar-container">
        <div className="navbar-logo" onClick={() => navigate("/")}>
          <h1>
            Movie<span className="logo-highlight">Flix</span>
          </h1>
        </div>

        <div className="navbar-controls">
          <button className="nav-link" onClick={() => navigate("/")}>
            <svg viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span>Home</span>
          </button>

          <button className="nav-link" onClick={() => navigate("/favorites")}>
            <svg viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
              2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09
              C13.09 3.81 14.76 3 16.5 3
              19.58 3 22 5.42 22 8.5
              c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span>Favorites</span>
          </button>

          <div className="divider"></div>

          {/* 🌗 Theme Toggle */}
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              /* ☀️ Sun icon for light mode */
              <svg viewBox="0 0 24 24">
                <path d="M12 4.5a1 1 0 0 1 1 1V7a1 1 0 1 1-2 0V5.5a1 1 0 0 1 1-1z
                M12 17a5 5 0 1 0 0-10a5 5 0 0 0 0 10z
                M4.5 13a1 1 0 1 1 0-2H6a1 1 0 1 1 0 2H4.5z
                M18 13a1 1 0 1 1 0-2h1.5a1 1 0 1 1 0 2H18z
                M6.34 6.34a1 1 0 0 1 1.41 0l1.06 1.06a1 1 0 0 1-1.41 1.41L6.34 7.75a1 1 0 0 1 0-1.41z
                M16.19 15.19a1 1 0 0 1 1.41 0l1.06 1.06a1 1 0 0 1-1.41 1.41l-1.06-1.06a1 1 0 0 1 0-1.41z" />
              </svg>
            ) : (
              /* 🌙 Moon icon for dark mode */
              <svg viewBox="0 0 24 24">
                <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9
                9-4.03 9-9c0-.46-.04-.92-.1-1.36
                A7 7 0 0 1 12 3z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
