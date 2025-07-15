import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Navbar from './components/navbar.js'
import PokemonInterface from './pokedex.js'
import PokemonDetail from './pokemonDetail.js'
import MyPokeDetail from './myPokemonDetail.js'
import Profile from './profile.js'
import MyPokedex from './my-pokemon.js'
import LoginPage from './login.js'
import CreateAccountPage from './create-account.js'
import SearchUserPage from './search-user.js'
import SearchProfile from './search-profiles.js'

function MainApp() {
  const [currentPage, setCurrentPage] = useState("pokedex")
  const location = useLocation();
  const hideNavbar = location.pathname === "/login" || location.pathname === "/create-account";

  return (
    <div>
      {!hideNavbar && <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />}
      <main>
        {/* {currentPage === "pokedex" && <PokemonInterface />}
        {currentPage === "profile" && <Profile />}
        {currentPage === "pokedex/:id" && <PokemonDetail />} */}
        <Routes>
          <Route path="/" element={<Navigate to= "/login" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/create-account" element={<CreateAccountPage />} />
          <Route path="/pokedex" element={<PokemonInterface />} />
          <Route path="/pokedex/:id" element={<PokemonDetail />} />
          <Route path="/my-pokemon/:pID/:id" element={<MyPokeDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/search-profile/:uID" element={<SearchProfile />} />
          <Route path="/my-pokemon" element={<MyPokedex />} />
          <Route path="/search-user" element={<SearchUserPage />} />
        </Routes>
      </main>
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <MainApp />
    </BrowserRouter>
  </StrictMode>
)
