import { AnimatePresence, motion } from 'framer-motion'
import { Bot, CheckCircle2, Sparkles, X } from 'lucide-react'
import { useState } from 'react'

export default function AIExplanation({ medicine }) {
  const [open, setOpen] = useState(false); const [loading, setLoading] = useState(false)
  const activate = () => { setOpen(true); setLoading(true); setTimeout(() => setLoading(false), 950) }
  return <><button className="ai-trigger" onClick={activate}><Sparkles size={16}/> Explain this choice</button><AnimatePresence>{open && <motion.div className="ai-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setOpen(false)}><motion.div className="ai-panel" initial={{opacity:0,y:24,scale:.97}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:20,scale:.97}} onClick={e => e.stopPropagation()}><button className="close-panel" onClick={() => setOpen(false)}><X size={18}/></button><div className="ai-orb"><Bot size={23}/><i/></div><span className="eyebrow"><Sparkles size={13}/> GenericX explanation</span><h2>{loading ? 'Looking at the details…' : 'The essentials, in plain English.'}</h2>{loading ? <div className="typing-lines"><i/><i/><i/></div> : <div className="ai-answer"><p><strong>{medicine.name}</strong> uses the same active ingredient as its comparable alternatives. The main difference is typically the manufacturer and price, not the intended effect.</p><div><CheckCircle2 size={17}/><span>Check the exact strength on your prescription before switching.</span></div><div><CheckCircle2 size={17}/><span>A pharmacist or clinician can help you make the right choice.</span></div></div>}</motion.div></motion.div>}</AnimatePresence></>
}
