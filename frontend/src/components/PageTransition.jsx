import { motion } from 'framer-motion'

export default function PageTransition({ children, className = '' }) {
  return <motion.div className={className} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .45, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>
}
