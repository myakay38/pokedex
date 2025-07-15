"use client"

import { useState, useRef, useEffect } from "react"
import { useLocation, Link, useNavigate } from "react-router-dom"
import { Menu, User, LogOut, BookOpen, ShoppingCart } from "lucide-react"
import "./navbar.css"

const navigationItems = [
  { name: "Pokédex", href: "/pokedex", icon: BookOpen },
  { name: "My Pokémon", href: "/my-pokemon", icon: User },
  { name: "Market", href: "/market", icon: ShoppingCart },
  { name: "Search User", href: "/search-user", icon: User }
]

export default function Navbar({ currentPage, setCurrentPage }) {
  const [user, setUser] = useState({id: localStorage.getItem("uID"), tradeCount: 0, displayName: "", username: "" })
  const navigate = useNavigate();
  useEffect(() => {
    fetch("http://localhost:8081/user/" + localStorage.getItem("uID"))
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch((err) => console.error("Failed to fetch user:", err));
  }, [])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  useEffect(() => {})
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef(null)
  useEffect(() => {
  function handleClickOutside(event) {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowProfileDropdown(false)
    }
  }

  document.addEventListener("mousedown", handleClickOutside)
  return () => {
    document.removeEventListener("mousedown", handleClickOutside)
  }
}, [])

  const location = useLocation();
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-content">
          {/* Logo */}
          <div className="navbar-logo">
            <img src="/src/assets/pokeball.png" alt="Pokéball Logo" className="logo-image" />
          </div>

          {/* Desktop Navigation */}
          <div className="desktop-nav">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname.startsWith(item.href)
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`nav-button ${isActive ? "nav-button-active" : ""}`}
                >
                  <Icon className="nav-icon" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* User Profile */}
          <div className="desktop-profile">
            <button onClick={() => setShowProfileDropdown(!showProfileDropdown)} className="profile-button">
              <div className="avatar">
                <div className="avatar-fallback">T</div>
              </div>
            </button>
            {showProfileDropdown && (
            <div className="profile-dropdown" ref={dropdownRef}>
              <div className="profile-dropdown-info">
                <p className="profile-name">{user.displayName}</p>
                <p className="profile-username">@{user.username}</p>
              </div>
              <hr className="dropdown-divider" />
              <Link to="/profile" onClick={() => setShowProfileDropdown(false)} className="dropdown-item">
                <User className="dropdown-icon" />
                <span>Profile</span>
              </Link>
              <button 
                className="dropdown-item" 
                onClick={() => {
                  localStorage.removeItem("uID");
                  setShowProfileDropdown(false);
                  navigate("/login");
                }}
              >
                <LogOut className="dropdown-icon" />
                <span>Log out</span>
              </button>
            </div>
          )}
          </div>

          {/* Mobile menu button */}
          <div className="mobile-menu-button">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="menu-toggle">
              <Menu className="menu-icon" />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu">
            <div className="mobile-menu-content">
              {/* User info in mobile */}
              <div className="mobile-user-info">
                <div className="mobile-avatar">
                  <div className="mobile-avatar-fallback">{user.displayName?.charAt(0) || "U"}</div>
                </div>
                <div className="mobile-user-details">
                  <p className="mobile-user-name">{user.displayName}</p>
                  <p className="mobile-user-email">@{user.username}</p>
                </div>
              </div>

              {/* Navigation items */}
              <div className="mobile-nav-items">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname.startsWith(item.href)
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`mobile-nav-button ${isActive ? "mobile-nav-button-active" : ""}`}
                    >
                      <Icon className="mobile-nav-icon" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </div>

              {/* Profile actions */}
              <div className="mobile-profile-actions">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mobile-action-button"
                >
                  <User className="mobile-action-icon" />
                  <span>Profile</span>
                </Link>
                <button className="mobile-action-button">
                  <LogOut className="mobile-action-icon" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
