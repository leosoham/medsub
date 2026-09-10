export default function MedicineCapsule({ color = '#b1d6ff', size = 'large' }) {
  return <span className={`medicine-capsule ${size}`} style={{ '--pill-color': color }}><i/><b/></span>
}
