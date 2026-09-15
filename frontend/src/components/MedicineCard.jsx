import { motion } from 'framer-motion'
import { ArrowRight, BadgeCheck, Scale } from 'lucide-react'
import { Link } from 'react-router-dom'
import MedicineCapsule from './MedicineCapsule'
import { formatRupees } from '../utils/formatters'

export default function MedicineCard({
  medicine,
  view = 'grid',
  selected,
  onSelect,
}) {
  const savings = medicine.savingPercent ?? 0

  return (
    <motion.article
      layout
      className={`medicine-card ${view} ${selected ? 'selected' : ''}`}
      whileHover={{ y: -5 }}
      transition={{
        type: 'spring',
        stiffness: 380,
        damping: 25,
      }}
    >
      <div
        className="med-visual"
        style={{ '--med-color': medicine.color }}
      >
        <MedicineCapsule
          color={medicine.color}
          size="medium"
        />

        <span className="tier-badge">
          Alternative
        </span>
      </div>

      <div className="med-content">
        <div className="med-title">
          <div>
            <h3>{medicine.name}</h3>

            <p>
              {medicine.dosageForm || 'Medicine'}
            </p>
          </div>

          <BadgeCheck
            size={17}
            className="verified"
          />
        </div>

        <p className="manufacturer">
          {medicine.manufacturer || 'Manufacturer unavailable'}
        </p>

        <div className="med-price-row">
          <div>
            <small>Price</small>

            <strong>
              {formatRupees(medicine.price)}
            </strong>
          </div>

          {savings > 0 && (
            <span className="savings-pill">
              Save {savings}%
            </span>
          )}
        </div>
      </div>

      <div className="med-actions">
        <Link
          to={`/medicine/${medicine.id}`}
          className="button button-outline small"
        >
          Details
          <ArrowRight size={14} />
        </Link>

        <button
          className={`compare-toggle ${selected ? 'active' : ''}`}
          onClick={() => onSelect?.(medicine)}
          type="button"
        >
          <Scale size={15} />

          <span>
            {selected ? 'Added' : 'Compare'}
          </span>
        </button>
      </div>
    </motion.article>
  )
}