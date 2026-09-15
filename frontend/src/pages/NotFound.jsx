import { ArrowLeft, SearchX } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageTransition from '../components/PageTransition'

export default function NotFound() { return <PageTransition className="not-found page-width"><div><SearchX size={42}/><span className="eyebrow">404 — not found</span><h1>This page took<br/><em>the day off.</em></h1><p>There’s nothing here, but your next medicine search is only a click away.</p><Link className="button button-dark" to="/"><ArrowLeft size={17}/> Back home</Link></div></PageTransition> }
