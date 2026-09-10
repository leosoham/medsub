import { AnimatePresence, motion } from 'framer-motion'
import { Menu, Moon, Search, Sun, X } from 'lucide-react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import useScrollPosition from '../hooks/useScrollPosition'
import Logo from './Logo'

const links = [ ['Home', '/'], ['Search medicine', '/search'], ['Symptom search', '/symptoms'], ['Prescription upload', '/upload'], ['Compare', '/compare'], ['About', '/about'] ]

export default function Navbar() {
  const { theme, toggleTheme } = useTheme(); const scrolled = useScrollPosition(); const [open, setOpen] = useState(false); const location = useLocation()
  const close = () => setOpen(false)
  return <header className={`nav-wrap ${scrolled ? 'is-scrolled' : ''}`}>
    <nav className="navbar page-width">
      <Logo />
      <div className="nav-links">{links.map(([label, to]) => <NavLink key={to} to={to} className={({isActive}) => isActive ? 'active' : ''}>{label}</NavLink>)}</div>
      <div className="nav-actions">
        <Link className="nav-search" to="/search" aria-label="Search"><Search size={17} /></Link>
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme"><motion.span initial={false} animate={{ rotate: theme === 'light' ? 0 : 180 }} transition={{ duration: .35 }}>{theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}</motion.span></button>
        <Link className="button button-small button-dark" to="/login">Sign in</Link>
        <button className="menu-button" onClick={() => setOpen(!open)} aria-label="Open navigation">{open ? <X /> : <Menu />}</button>
      </div>
    </nav>
    <AnimatePresence>{open && <motion.div className="mobile-menu" initial={{opacity:0,y:-12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-12}}>{links.map(([label, to]) => <NavLink onClick={close} key={to} to={to} className={location.pathname === to ? 'active' : ''}>{label}</NavLink>)}<Link onClick={close} className="button button-dark full-width" to="/login">Sign in</Link></motion.div>}</AnimatePresence>
  </header>
}
