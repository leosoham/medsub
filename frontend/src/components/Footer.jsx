import { AtSign, Heart, Send } from 'lucide-react'
import Logo from './Logo'

export default function Footer() {
  return <footer className="footer"><div className="page-width footer-grid"><div><Logo /><p className="footer-copy">Clarity for every medicine choice.</p></div><div className="footer-links"><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Contact</a></div><div className="footer-social"><a href="#" aria-label="Contact"><Send size={16}/></a><a href="#" aria-label="Email"><AtSign size={16}/></a></div></div><div className="page-width footer-bottom">Built for more confident care <Heart size={13} fill="currentColor" /></div></footer>
}
