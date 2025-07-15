import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./search-user.css";

export default function SearchUserPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.trim() === "") {
        setResults([]);
        return;
      }

      fetch(`http://localhost:8081/searchUser?query=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => setResults(data))
        .catch((err) => {
          console.error("Search failed:", err);
          setResults([]);
        });
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  return (
    <div className="search-container">
        <div className="pokedex-header">
            <h1 className="pokedex-title">Search for a User</h1>
            <p className="pokedex-subtitle">Search and connect with fellow users</p>
        </div>
      <input
        type="text"
        placeholder="Search by username or uID"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="search-input"
      />
      <div className="card-results">
        {Array.isArray(results) && results.length === 0 && query.trim() !== "" && (
            <p className="no-results">No users found.</p>
        )}
        {Array.isArray(results) &&
            results.map((user) => (
            <Link
                to={`/search-profile/${user.uID}`}
                key={user.uID}
                className="user-card-link"
            >
                <div className="user-card">
                <div className="card-avatar">{user.name[0]?.toUpperCase()}</div>
                <div className="card-info">
                    <p className="card-name">{user.name} <span>(@{user.username})</span></p>
                    <p className="card-id">uID: {user.uID}</p>
                </div>
                </div>
            </Link>
            ))}
        </div>  
    </div>
  );
}