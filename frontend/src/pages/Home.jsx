import { motion } from 'framer-motion'
import { ArrowDownRight, ArrowRight, BadgeCheck, BrainCircuit, ChevronRight, FileScan, HeartPulse, Pill, ScanSearch, ShieldCheck, Sparkles, Stethoscope, UploadCloud, WalletCards } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageTransition from '../components/PageTransition'
import SpotlightSearch from '../components/SpotlightSearch'
import MedicineCapsule from '../components/MedicineCapsule'

const features = [
  { icon: ScanSearch, title: 'Search medicine', text: 'Find brands, salts, and the details that matter.', to: '/search', tone: 'blue' },
  { icon: BrainCircuit, title: 'Clear explanations', text: 'Simple, dependable answers about alternatives.', to: '/search', tone: 'lavender' },
  { icon: Pill, title: 'Compare choices', text: 'See equivalent options, side by side.', to: '/compare', tone: 'peach' },
  { icon: FileScan, title: 'Read prescriptions', text: 'Bring a prescription into focus in seconds.', to: '/upload', tone: 'mint' },
]
const steps = [ ['01', 'Search a medicine', 'Start with a brand name or composition.'], ['02', 'See alternatives', 'Explore medically equivalent choices.'], ['03', 'Understand the difference', 'Get a plain-English explanation.'], ['04', 'Choose with confidence', 'Save your result for your next visit.'] ]

export default function Home() {
  return <PageTransition>
    <section className="hero page-width">
      <div className="hero-copy">
        <motion.div className="eyebrow" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:.08}}><span className="live-dot"/> Your medicine, made clear</motion.div>
        <motion.h1 initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:.14}}>Better choices.<br/><em>Made clear.</em></motion.h1>
        <motion.p className="hero-lede" initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:.2}}>GenericX makes it easy to understand your medicine, compare equivalent options, and make every prescription go further.</motion.p>
        <motion.div className="hero-actions" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:.26}}><Link className="button button-dark button-large" to="/search">Find a medicine <ArrowRight size={18}/></Link><Link className="text-link" to="/upload">Upload a prescription <UploadCloud size={16}/></Link></motion.div>
        <motion.div className="trust-line" initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.35}}><span><ShieldCheck size={18}/> Built on verified sources</span><i></i><span>Always free to search</span></motion.div>
      </div>
      <motion.div className="hero-art" initial={{opacity:0,scale:.94}} animate={{opacity:1,scale:1}} transition={{duration:.75, delay:.1, ease:[.22,1,.36,1]}}>
        <div className="art-orb art-orb-one"></div><div className="art-orb art-orb-two"></div><div className="art-grid"></div>
        <div className="art-card primary-card"><div className="card-topline"><span className="round-icon blue"><HeartPulse size={18}/></span><span className="pill-label">YOUR MEDICINE</span></div><h3>One choice can<br/>make a difference.</h3><div className="price-shift"><span>Brand price <b>₹154</b></span><ArrowDownRight size={22}/><span className="save">Save up to <b>71%</b></span></div></div>
        <div className="art-card capsule-card"><MedicineCapsule color="#9cbbff"/><p>Same active ingredient</p><strong>More clarity</strong></div>
        <div className="art-card verified-card"><BadgeCheck size={18}/><span>GenericX<br/><b>verified</b></span></div>
        <div className="art-spark one"><Sparkles size={24}/></div><div className="art-spark two"><span></span></div>
      </motion.div>
    </section>

    <section className="numbers-wrap"><div className="page-width numbers"><div><strong>28K<span>+</span></strong><p>Medicines indexed</p></div><div><strong>8,400<span>+</span></strong><p>Generic alternatives</p></div><div><strong>61<span>%</span></strong><p>Average savings found</p></div><div><strong>100<span>%</span></strong><p>Trusted sources</p></div></div></section>

    <section className="search-section page-width"><div className="section-heading center"><span className="eyebrow"><Sparkles size={14}/> A simpler way to search</span><h2>Find the answer in a moment.</h2><p>Start with a name, a salt, or even what you’re feeling.</p></div><SpotlightSearch/><div className="quick-searches"><span>Try one of these</span>{['Dolo 650', 'Pantoprazole', 'Azithromycin'].map(item => <Link key={item} to={`/search?q=${item}`}>{item}<ChevronRight size={13}/></Link>)}</div></section>

    <section className="feature-section page-width"><div className="section-heading"><span className="eyebrow"><span className="eyebrow-icon">✦</span> Made for the everyday</span><h2>Everything you need.<br/><em>Nothing you don’t.</em></h2></div><div className="feature-grid">{features.map(({icon: Icon,title,text,to,tone}, index) => <Link className={`feature-card ${tone}`} to={to} key={title}><div className="feature-icon"><Icon size={22}/></div><span className="feature-number">0{index + 1}</span><h3>{title}</h3><p>{text}</p><span className="card-arrow"><ArrowRight size={17}/></span></Link>)}</div></section>

    <section className="how-section"><div className="page-width how-inner"><div className="section-heading"><span className="eyebrow">How GenericX works</span><h2>More confidence,<br/><em>at every step.</em></h2><p>We turn a complicated decision into a simple, informed one.</p></div><div className="step-list">{steps.map(([number,title,text],i) => <div className="step" key={number}><div className="step-number">{number}</div><div><h3>{title}</h3><p>{text}</p></div>{i < 3 && <div className="step-line"/>}</div>)}</div></div></section>

    <section className="closing-cta page-width"><div className="cta-glow"></div><div><span className="eyebrow light"><Stethoscope size={14}/> Care starts with clarity</span><h2>Good medicine is<br/>informed medicine.</h2><p>Search, compare, and understand your options — on your terms.</p><Link className="button button-light button-large" to="/search">Explore GenericX <ArrowRight size={18}/></Link></div><div className="cta-pills"><MedicineCapsule color="#f4d0cc"/><MedicineCapsule color="#abc5f0" size="medium"/><MedicineCapsule color="#acd7c0" size="small"/></div></section>
  </PageTransition>
}
