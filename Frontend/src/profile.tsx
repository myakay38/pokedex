"use client"

import { useState, useEffect } from "react"
import { Edit2, Save, X, Plus } from "lucide-react"
import { Link } from "react-router-dom"
import "./profile.css"
import "./details.css"


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

type EffectType = {
  type: string,
  atkAvg: number,
  defAvg: number
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
          <div className="flex flex-wrap gap-1 justify-center md:justify-start mb-3">
            {pokemon.types.map((type) => (
              <span key={type} className={`badge badge-type type-${type.toLowerCase()}  text-white`}>
                  {type}
              </span>
            ))}
          </div>
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

function PokemonCard({ pokemon, isSelected, onSelect, showSelectButton }) {
  return (
    <div className={`showcase-card ${isSelected ? "showcase-card-selected" : ""}`}>
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
        <div className="flex flex-wrap gap-1 justify-center">
            {pokemon.types.map((type) => (
              <span key={type} className={`badge badge-type type-${type.toLowerCase()}  text-white`}>
                  {type}
              </span>
            ))}
          </div>
      </div>      
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

function PokemonSelectionModal({ isOpen, onClose, userPokemon, selectedPokemon, onSelectionChange, title, filterFunc }) {
  const [pokemonList, setPokemonList] = useState<PokemonDetailType[]>([]);
  const [tempSelected, setTempSelected] = useState(selectedPokemon);
  useEffect(() => {
      fetch("http://localhost:8081/userPokemon")
        .then((res) => res.json())
        .then((data) => setPokemonList(data))
        .catch((err) => console.error("Failed to fetch Pokémon:", err));
  }, [])
  useEffect(() => {
    setTempSelected(pokemonList.filter(
      filterFunc,
    ));
  }, [pokemonList])

  const handlePokemonSelect = (pokemon) => {
    const isAlreadySelected = tempSelected.some((p) => p.id === pokemon.id)

    if (isAlreadySelected) {
      setTempSelected(tempSelected.filter((p) => p.id !== pokemon.id))
    } else if (tempSelected.length < 6) {
      setTempSelected([...tempSelected, pokemon])
    }
  }

  const handleSave = () => {
    onSelectionChange(tempSelected)
    onClose()
  }

  const handleCancel = () => {
    setTempSelected(selectedPokemon)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title} (Choose up to 6)</h2>
        </div>
        <div className="modal-body">
          <div className="selection-count">Selected: {tempSelected.length}/6</div>
          <div className="pokemon-selection-grid">
            {userPokemon.map((pokemon) => (
              <PokemonCard
                key={pokemon.id}
                pokemon={pokemon}
                isSelected={tempSelected.some((p) => p.id === pokemon.id)}
                onSelect={handlePokemonSelect}
                showSelectButton={true}
              />
            ))}
          </div>
          <div className="modal-actions">
            <button className="modal-button modal-button-cancel" onClick={handleCancel}>
              Cancel
            </button>
            <button className="modal-button modal-button-save" onClick={handleSave}>
              Save Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


export default function Profile() {
  const [pokemonList, setPokemonList] = useState<PokemonDetailType[]>([]);
  const [user, setUser] = useState({id: localStorage.getItem("uID"), tradeCount: 0, displayName: "", username: "" })
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedDisplayName, setEditedDisplayName] = useState(user.displayName)
  const [isShowcaseModalOpen, setIsShowcaseModalOpen] = useState(false)
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false)
  const [showcasedPokemon, setShowcasedPokemon] = useState<PokemonDetailType[]>([])
  const [myTeam, setMyTeam] = useState<PokemonDetailType[]>([])
  const [teamSummary, setTeamSummary] = useState<EffectType[]>([])

  useEffect(() => {
    fetch("http://localhost:8081/user/" + localStorage.getItem("uID"))
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch((err) => console.error("Failed to fetch user: ", err));
  }, [])

  useEffect(() => {
      fetch(`http://localhost:8081/userPokemon?uID=${localStorage.getItem("uID")}`)
        .then((res) => res.json())
        .then((data) => setPokemonList(data))
        .catch((err) => console.error("Failed to fetch Pokémon:", err));
  }, [])

  useEffect(() => {
    fetch("http://localhost:8081/teamSummary/" + localStorage.getItem("uID"))
      .then((res) => res.json())
      .then((data) => setTeamSummary(data))
      .catch((err) => console.error("Failed to fetch team summary:", err));
  }, [])


  useEffect(() => {
    setShowcasedPokemon(pokemonList.filter(
      (p) => p.showcase===true,
    ));
  }, [pokemonList])

  useEffect(() => {
    setMyTeam(pokemonList.filter(
      (p) => p.onTeam===true,
    ));
  }, [pokemonList])
  

  const handleSaveDisplayName = async () => {
    try {
      console.log("Updating user's name");
      const response = await fetch("http://localhost:8081/updateUserDisplayName", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({uID: localStorage.getItem("uID"), name: editedDisplayName})
      })
    } catch (err) {
      console.error("Error updating user's name: ", err);
      alert("Something went wrong updating your name.")
    }
    setUser({ ...user, displayName: editedDisplayName }) // Update database
    setIsEditingName(false)
  } 

  const handleCancelEdit = () => {
    setEditedDisplayName(user.displayName)
    setIsEditingName(false)
  }

  const handleShowcaseChange = async (selectedPokemon) => {
    // Call setShowcased to selected pokemon
    try {
      console.log("Marking Pokemon: ", selectedPokemon.map((p)=>(p.nickname)));
      const response = await fetch("http://localhost:8081/setShowcased", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({instanceIDs: selectedPokemon.map((p)=>(p.id)), user: localStorage.getItem("uID")}),
      });
      // Convert UserPokemon to ShowcasedPokemon format

      setShowcasedPokemon(selectedPokemon);

    } catch (err) {
      console.error("Error showcasing Pokémon: ", err);
      alert("Something went wrong adding the Pokémon.")
    }

    
  }

  const handleTeamChange = async (selectedPokemon) => {
    // Call setShowcased to selected pokemon
    try {
      console.log("Marking Pokemon: ", selectedPokemon.map((p)=>(p.nickname)));
      const response = await fetch("http://localhost:8081/setTeam", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({instanceIDs: selectedPokemon.map((p)=>(p.id)), user: localStorage.getItem("uID")}),
      });

      setMyTeam(selectedPokemon);

      const teamSum = await fetch(`http://localhost:8081/teamSummary/${localStorage.getItem("uID")}`);
      const teamSumData = await teamSum.json();
      setTeamSummary(teamSumData);

    } catch (err) {
      console.error("Error showcasing Pokémon: ", err);
      alert("Something went wrong adding the Pokémon.")
    }

    
  }

  // Convert showcased Pokemon to UserPokemon format for selection
  const selectedForShowcase = showcasedPokemon.map((pokemon, index) => {
    const userPokemon = pokemonList.filter(
      (p) => p.nickname === pokemon.nickname && p.level === pokemon.level && p.name === pokemon.name,
    )
    return userPokemon
  })

  const selectedForTeam = myTeam.map((pokemon, index) => {
    const userPokemon = pokemonList.filter(
      (p) => p.nickname === pokemon.nickname && p.level === pokemon.level && p.name === pokemon.name,
    )
    return userPokemon
  })

  return (
    <div className="profile-container">
      {/* Profile Header */}
      <div className="profile-card">
        <div className="profile-card-content">
          <div className="profile-info">
            {/* Profile Picture */}
            <div className="profile-avatar">
              <div className="avatar-fallback">{user.displayName.charAt(0)}</div>
            </div>

            {/* Profile Info */}
            <div className="profile-details">
              {/* Display Name */}
              <div className="name-section">
                {isEditingName ? (
                  <div className="name-edit">
                    <input
                      value={editedDisplayName}
                      onChange={(e) => setEditedDisplayName(e.target.value)}
                      className="name-input"
                    />
                    <button className="edit-button edit-button-save" onClick={handleSaveDisplayName}>
                      <Save className="edit-icon" />
                    </button>
                    <button className="edit-button edit-button-cancel" onClick={handleCancelEdit}>
                      <X className="edit-icon" />
                    </button>
                  </div>
                ) : (
                  <div className="name-display">
                    <h1 className="profile-name">{user.displayName}</h1>
                    <button className="edit-button edit-button-ghost" onClick={() => setIsEditingName(true)}>
                      <Edit2 className="edit-icon" />
                    </button>
                  </div>
                )}
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
          <button className="edit-showcase-button" onClick={() => setIsShowcaseModalOpen(true)}>
            <Edit2 className="edit-showcase-icon" />
            Edit Showcase
          </button>
        </div>

        {showcasedPokemon.length > 0 ? (
          <div className="showcase-grid">
            {showcasedPokemon.map((pokemon, index) => (
              <PokemonLink key={`${pokemon.nickname}-${index}`} pokemon={pokemon} />
            ))}
            {/* Empty slots */}
            {Array.from({ length: 6 - showcasedPokemon.length }).map((_, index) => (
              <div key={`empty-${index}`} className="empty-slot">
                <button className="empty-slot-button" onClick={() => setIsShowcaseModalOpen(true)}>
                  <Plus className="empty-slot-icon" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-showcase">
            <p className="no-showcase-text">No Pokémon showcased yet</p>
            <button className="add-showcase-button" onClick={() => setIsShowcaseModalOpen(true)}>
              <Plus className="add-showcase-icon" />
              Add Pokémon to Showcase
            </button>
          </div>
        )}
      </div>

      {/* Pokemon on my Team */} 
      <div className="showcase-section">
        <div className="showcase-header">
          <h2 className="showcase-title">My Team</h2>
          <button className="edit-showcase-button" onClick={() => setIsTeamModalOpen(true)}>
            <Edit2 className="edit-showcase-icon" />
            Edit Team
          </button>
        </div>
        {/* still working */}
        {myTeam.length > 0 ? (
          <div className="showcase-grid">
            {myTeam.map((pokemon, index) => (
              <PokemonLink key={`${pokemon.nickname}-${index}`} pokemon={pokemon} />
            ))}
            {/* Empty slots */}
            {Array.from({ length: 6 - myTeam.length }).map((_, index) => (
              <div key={`empty-${index}`} className="empty-slot">
                <button className="empty-slot-button" onClick={() => {setIsTeamModalOpen(true)}}>
                  <Plus className="empty-slot-icon" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-showcase">
            <p className="no-showcase-text">No Pokémon are on your team yet</p>
            <button className="add-showcase-button" onClick={() => setIsTeamModalOpen(true)}>
              <Plus className="add-showcase-icon" />
              Add Pokémon to Showcase
            </button>
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

      {/* Pokemon Showcase Selection Modal */}
      <PokemonSelectionModal
        isOpen={isShowcaseModalOpen}
        onClose={() => setIsShowcaseModalOpen(false)}
        userPokemon={pokemonList}
        selectedPokemon={showcasedPokemon}
        onSelectionChange={handleShowcaseChange}
        title="Select Your Showcased Pokémon"
        filterFunc={(p) => p.showcase===true}
      />
      {/* Pokemon Team Selection Modal */}
      <PokemonSelectionModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        userPokemon={pokemonList}
        selectedPokemon={myTeam}
        onSelectionChange={handleTeamChange}
        title="Select the Pokémon for Your Team"
        filterFunc={(p) => p.onTeam===true}
      />
    </div>
  )
}
