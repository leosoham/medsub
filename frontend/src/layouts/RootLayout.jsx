import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function RootLayout() {
  return <div className="site-shell"><Navbar /><main><Outlet /></main><Footer /></div>
}
