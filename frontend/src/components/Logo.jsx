import { Cross } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Logo() {
  return <Link to="/" className="logo" aria-label="GenericX home"><span className="logo-mark"><Cross size={15} strokeWidth={3} /></span><span>GenericX</span></Link>
}
