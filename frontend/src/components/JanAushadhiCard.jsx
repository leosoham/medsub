import { BadgeCheck, IndianRupee, ShieldCheck } from 'lucide-react'
import { formatRupees } from '../utils/formatters'

export default function JanAushadhiCard({ option }) {
  if (!option) {
    return null
  }

  const savingPercent = Number(option.savingPercent) || 0
  const amountSaved = Number(option.amountSaved) || 0

  return (
    <section className="jan-aushadhi-option">
      <div className="jan-aushadhi-header">
        <div>
          <span className="eyebrow">
            <ShieldCheck size={13} />
            JAN AUSHADHI
          </span>

          <h2>Government generic option</h2>

          <p>
            A lower-cost generic option for the same
            medicine category.
          </p>
        </div>

        <div className="jan-aushadhi-badge">
          <BadgeCheck size={16} />
          Verified price
        </div>
      </div>

      <div className="jan-aushadhi-content">
        <div className="jan-aushadhi-name">
          <span className="jan-aushadhi-icon">
            <IndianRupee size={20} />
          </span>

          <div>
            <strong>{option.genericName}</strong>

            <small>
              Available through Jan Aushadhi
            </small>
          </div>
        </div>

        <div className="jan-aushadhi-stats">
          <div>
            <span>Official price</span>

            <strong>
              {formatRupees(option.officialPrice)}
            </strong>
          </div>

          <div>
            <span>You save</span>

            <strong>
              {formatRupees(amountSaved)}
            </strong>
          </div>

          <div>
            <span>Saving</span>

            <strong>
              {savingPercent}%
            </strong>
          </div>
        </div>
      </div>
    </section>
  )
}