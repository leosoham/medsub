import { AnimatePresence } from 'framer-motion'
import { Routes, Route, useLocation } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import Home from './pages/Home'
import Search from './pages/Search'
import MedicineDetail from './pages/MedicineDetail'
import UploadPrescription from './pages/UploadPrescription'
import About from './pages/About'
import Login from './pages/Login'
import NotFound from './pages/NotFound'

export default function App() {
  const location = useLocation()
  return <AnimatePresence mode="wait">
    <Routes location={location} key={location.pathname}>
      <Route element={<RootLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/symptoms" element={<Search symptomMode />} />
        <Route path="/upload" element={<UploadPrescription />} />
        <Route path="/medicine/:id" element={<MedicineDetail />} />
        <Route path="/compare" element={<Search compareMode />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  </AnimatePresence>
}
