"use client"

import { useState, useEffect } from "react"
import { Link, useParams } from "react-router-dom"
import "./profile.css"


type PokemonSummaryType = {
  id: number,
  number: number,
  nickname: string,
  level: number,
  name: string
}

type PokemonDetailType = {
  id: number,
  number: number,
  name: string,
  types: string[],
  stats: PokemonStatType,
  level: number,
  nickname: string,
  showcase: boolean,
  onTeam: boolean
};

type PokemonStatType = {
    hp: number,
    atk: number,
    def: number,
    spAtk: number,
    spDef: number,
    speed: number
}

function PokemonLink({ pokemon, isSelected, onSelect, showSelectButton }) {
  return (
    <div className={`showcase-card ${isSelected ? "showcase-card-selected" : ""}`}>
      <Link
        to={`/my-pokemon/${pokemon.number}/${pokemon.id}`}
        key={pokemon.id}
        style={{ textDecoration:"none", color: "inherit" }}
      >
        <div className="showcase-card-header">
          <div className="showcase-level">Lv. {pokemon.level}</div>
          {showSelectButton && "id" in pokemon && (
            <button
              className={`select-button ${isSelected ? "select-button-selected" : ""}`}
              onClick={() => onSelect?.(pokemon)}
            >
              {isSelected ? "Selected" : "Select"}
            </button>
          )}
        </div>
        <div className="showcase-card-content">
          <h3 className="showcase-nickname">{pokemon.nickname}</h3>
          <p className="showcase-species">{pokemon.name}</p>
        </div>
      </Link>
    </div>
  )
}

const getEffectivenessColor = (value) => {
  if (value >= 1.5) return "text-green-600 bg-green-50"
  if (value >= 1.2) return "text-green-500 bg-green-50"
  if (value <= 0.5) return "text-red-600 bg-red-50"
  if (value <= 0.8) return "text-red-500 bg-red-50"
  return "text-gray-600 bg-gray-50"
}

const getEffectivenessLabel = (value) => {
  if (value >= 1.8) return "Excellent"
  if (value >= 1.2) return "Good"
  if (value <= 0.5) return "Poor"
  if (value <= 0.8) return "Weak"
  return "Average"
}

const getStatClass = (stat: number) => {
  if (stat >= 2) return "stat-excellent"
  if (stat >= 0.8) return "stat-high"
  if (stat >= 0.5) return "stat-medium"
  return "stat-low"
}

export default function SearchProfile() {
  const { uID } = useParams();
  const effectiveUID = uID || localStorage.getItem("uID");
  const [pokemonList, setPokemonList] = useState<PokemonDetailType[]>([]);
  const [user, setUser] = useState({id: effectiveUID, tradeCount: 0, displayName: "", username: "" })
  const [showcasedPokemon, setShowcasedPokemon] = useState<PokemonDetailType[]>([]);
  const [myTeam, setMyTeam] = useState<PokemonDetailType[]>([]);
  const [teamSummary, setTeamSummary] = useState<EffectType[]>([])

  useEffect(() => {
    fetch(`http://localhost:8081/user/${effectiveUID}`)
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch((err) => console.error("Failed to fetch user: ", err));
  }, [effectiveUID])

  useEffect(() => {
      fetch(`http://localhost:8081/userPokemon?uID=${effectiveUID}`)
        .then((res) => res.json())
        .then((data) => setPokemonList(data))
        .catch((err) => console.error("Failed to fetch Pokémon:", err));
  }, [effectiveUID])

  useEffect(() => {
    const showcased = pokemonList.filter((p) => p.showcase === true);
    setShowcasedPokemon(showcased);
  }, [pokemonList]);

  useEffect(() => {
    const team = pokemonList.filter((p) => p.onTeam === true);
    setMyTeam(team);
  }, [pokemonList]);

  useEffect(() => {
    fetch(`http://localhost:8081/teamSummary/${effectiveUID}`)
      .then((res) => res.json())
      .then((data) => setTeamSummary(data))
      .catch((err) => console.error("Failed to fetch team summary:", err));
  }, [])
  

  return (
    <div className="profile-container">
      {/* Profile Header */}
      <div className="profile-card">
        <div className="profile-card-content">
          <div className="profile-info">
            {/* Profile Picture */}
            <div className="profile-avatar">
              <div className="avatar-fallback">{user.displayName ? user.displayName.charAt(0) : "?"}</div>
            </div>

            {/* Profile Info */}
            <div className="profile-details">
              {/* Display Name */}
              <div className="name-section">
                  <div className="name-display">
                    <h1 className="profile-name">{user.displayName}</h1>
                  </div>
                <p className="profile-username">@{user.username}</p>
              </div>

              {/* Stats */}
              <div className="profile-stats">
                <div className="stat-item">
                  <div className="stat-number">{user.tradeCount}</div>
                  <div className="stat-label">Trades</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{pokemonList.length}</div>
                  <div className="stat-label">Pokémon Caught</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Showcased Pokemon */}
      <div className="showcase-section">
        <div className="showcase-header">
          <h2 className="showcase-title">Showcased Pokémon</h2>
        </div>

        {showcasedPokemon.length > 0 ? (
          <div className="showcase-grid">
            {showcasedPokemon.map((pokemon, index) => (
              <PokemonLink key={`${pokemon.nickname}-${index}`} pokemon={pokemon} />
            ))}
          </div>
        ) : (
          <div className="no-showcase">
            <p className="no-showcase-text">No Pokémon showcased yet</p>
          </div>
        )}
      </div>

      {/* Pokemon on my Team */} 
      <div className="showcase-section">
        <div className="showcase-header">
          <h2 className="showcase-title">My Team</h2>
        </div>
        {/* still working */}
        {myTeam.length > 0 ? (
          <div className="showcase-grid">
            {myTeam.map((pokemon, index) => (
              <PokemonLink key={`${pokemon.nickname}-${index}`} pokemon={pokemon} />
            ))}
          </div>
        ) : (
          <div className="no-showcase">
            <p className="no-showcase-text">No Pokémon are on your team yet</p>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Offensive Analysis */}
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-foreground mb-2">Offensive Coverage</h4>
            <p className="text-sm text-muted-foreground mb-4">
              How well your team attacks each type (higher = better)
            </p>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {teamSummary.map((type) => {
              const effectiveness = type.atkAvg;
              const percentage = Math.max(Math.min(((Math.log2(Math.max(effectiveness, 0.001)) / 5) + 0.5) * 100, 100), 0) // Scale 0-2 to 0-100%
              return (
                <div key={type.type} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span key={type.type} className={`badge badge-type type-${type.type.toLowerCase()}  text-white`}>
                          {type.type}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${getEffectivenessColor(effectiveness)}`}>
                        {getEffectivenessLabel(effectiveness)}
                      </span>
                    </div>
                    <span className="font-mono text-sm font-medium">{effectiveness.toFixed(1)}×</span>
                  </div>
                  <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={`stat-bar h-full rounded-full ${getStatClass(effectiveness)}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          
        </div>

        {/* Defensive Analysis */}
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-foreground mb-2">Defensive Resistances</h4>
            <p className="text-sm text-muted-foreground mb-4">
              How well your team defends against each type (higher = better)
            </p>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {teamSummary.map((type) => {
              const effectiveness = type.defAvg
              const percentage = Math.max(Math.min(((Math.log2(Math.max(effectiveness, 0.001)) / 5) + 0.5) * 100, 100), 0) // Scale 0-2 to 0-100%
              const getDefensiveLabel = (value) => {
                if (value <= 0.5) return "Vulnerable"
                if (value <= 0.8) return "Weak"
                if (value >= 1.8) return "Excellent"
                if (value >= 1.2) return "Good"
                return "Average"
              }

              return (
                <div key={type.type} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span key={type.type} className={`badge badge-type type-${type.type.toLowerCase()} text-white`}>
                          {type.type}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${getEffectivenessColor(effectiveness)}`}>
                        {getDefensiveLabel(effectiveness)}
                      </span>
                    </div>
                    <span className="font-mono text-sm font-medium">{effectiveness.toFixed(1)}×</span>
                  </div>
                  <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={`stat-bar h-full rounded-full ${getStatClass(effectiveness)}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
      </div>
      {/* Summary */}
      <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-semibold mb-2 text-sm text-foreground">Analysis Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div>
              <strong>Offensive Strengths:</strong> Types your team attacks effectively
              <br />
              <strong>Coverage Gaps:</strong> Types your team struggles to attack
            </div>
            <div>
              <strong>Defensive Strengths:</strong> Types your team resists well
              <br />
              <strong>Vulnerabilities:</strong> Types that threaten your team
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
