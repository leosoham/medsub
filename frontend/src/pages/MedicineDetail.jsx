import {
  ArrowLeft,
  BadgeCheck,
  Check,
  ChevronRight,
  CircleAlert,
  Pill,
  ShieldCheck,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'

import AIExplanation from '../components/AIExplanation'
import MedicineCapsule from '../components/MedicineCapsule'
import PageTransition from '../components/PageTransition'

import {
  getMedicineNameFromId,
  getMedicineSubstitutes,
  normalizeSubstitutionResponse,
} from '../services/medicineService'

import { formatRupees } from '../utils/formatters'

export default function MedicineDetail() {
  const { id } = useParams()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadMedicine() {
      try {
        setLoading(true)
        setError('')

        const medicineName =
          getMedicineNameFromId(id)

        const response =
          await getMedicineSubstitutes(
            medicineName,
          )

        const normalized =
          normalizeSubstitutionResponse(
            response,
          )

        if (!cancelled) {
          setData(normalized)
        }
      } catch (err) {
        console.error(
          'Failed to load medicine:',
          err,
        )

        if (!cancelled) {
          setData(null)
          setError(
            'We could not load this medicine right now.',
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    if (id) {
      loadMedicine()
    }

    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <PageTransition className="detail-page page-width">
        <div className="empty-state">
          <h2>
            Loading medicine details…
          </h2>

          <p>
            Getting verified information and
            available alternatives.
          </p>
        </div>
      </PageTransition>
    )
  }

  if (error || !data?.searchedMedicine) {
    return (
      <PageTransition className="detail-page page-width">
        <Link
          className="back-link"
          to="/search"
        >
          <ArrowLeft size={16} />
          Back to search
        </Link>

        <div className="empty-state">
          <CircleAlert size={31} />

          <h2>
            Medicine details unavailable
          </h2>

          <p>
            {error ||
              'We could not find this medicine.'}
          </p>
        </div>
      </PageTransition>
    )
  }

  const medicine = data.searchedMedicine
  const alternatives = data.substitutes.slice(
    0,
    3,
  )
  const janAushadhi = data.janAushadhi

  const janAushadhiPrice =
  janAushadhi?.officialPrice ?? null

const priceDifference =
  janAushadhiPrice !== null
    ? medicine.price - janAushadhiPrice
    : null

const hasSaving =
  priceDifference !== null &&
  priceDifference > 0

const hasSamePrice =
  priceDifference !== null &&
  priceDifference === 0

const janAushadhiIsMoreExpensive =
  priceDifference !== null &&
  priceDifference < 0

const savingAmount =
  hasSaving ? priceDifference : 0

const savingPercent =
  hasSaving
    ? Math.round(
        (savingAmount / medicine.price) * 100,
      )
    : 0

const extraCost =
  janAushadhiIsMoreExpensive
    ? Math.abs(priceDifference)
    : 0

  return (
    <PageTransition className="detail-page page-width">
      <Link
        className="back-link"
        to="/search"
      >
        <ArrowLeft size={16} />
        Back to search
      </Link>

      <section className="detail-hero">
        <div
          className="detail-visual"
          style={{
            '--med-color': '#8EADED',
          }}
        >
          <MedicineCapsule
            color="#8EADED"
          />

          <span className="floating-verified">
            <BadgeCheck size={17} />
            Verified details
          </span>
        </div>

        <div className="detail-title">
          <span className="eyebrow">
            {medicine.dosageForm ||
              'Medicine'}
          </span>

          <h1>{medicine.name}</h1>

          <p className="composition">
            {medicine.composition}
          </p>

          <p className="detail-maker">
            Made by {medicine.manufacturer}
          </p>

          <div className="detail-pills">
            <span>
              <Check size={14} />
              Prescription details
            </span>

            <span>
              <ShieldCheck size={14} />
              Source checked
            </span>
          </div>
        </div>

        <div className="price-card">
          <small>
            Current medicine price
          </small>

          <div>
            <span>Price</span>

            <strong>
              {formatRupees(medicine.price)}
            </strong>
          </div>

          {hasSaving ? (
  <p>
    Potential saving{' '}
    <b>
      up to {savingPercent}%
    </b>
  </p>
) : janAushadhiIsMoreExpensive ? (
  <p>
    Jan Aushadhi is{' '}
    <b>
      {formatRupees(extraCost)} higher
    </b>
  </p>
) : hasSamePrice ? (
  <p>
    Same price as Jan Aushadhi
  </p>
) : (
  <p>
    Price information verified
  </p>
)}
        </div>
      </section>

      <section className="detail-layout">
        <div className="detail-main">
          <section className="info-card">
            <h2>
              About this medicine
            </h2>

            <p>
              {medicine.name} contains{' '}
              {medicine.composition}.
            </p>

            <div className="fact-grid">
              <div>
                <span>
                  Composition
                </span>

                <strong>
                  {medicine.composition}
                </strong>
              </div>

              <div>
                <span>
                  Manufacturer
                </span>

                <strong>
                  {medicine.manufacturer}
                </strong>
              </div>

              <div>
                <span>
                  Dosage form
                </span>

                <strong>
                  {medicine.dosageForm}
                </strong>
              </div>

              <div>
                <span>
                  Price
                </span>

                <strong>
                  {formatRupees(
                    medicine.price,
                  )}
                </strong>
              </div>
            </div>
          </section>

          <section className="info-card">
            <h2>
              Uses & information
            </h2>

            <div className="usage-columns">
              <div>
                <h3>
                  Common uses
                </h3>

                <p>
                  {medicine.uses ||
                    'Uses information is not available.'}
                </p>
              </div>

              <div>
                <h3>
                  Possible side effects
                </h3>

                <p>
                  {medicine.sideEffects ||
                    'Side-effect information is not available.'}
                </p>
              </div>
            </div>

            <div className="safety-note">
              <CircleAlert size={19} />

              <p>
                Medicine information is
                educational and does not replace
                advice from a qualified health
                professional. Always follow your
                prescription and consult a
                healthcare professional when
                needed.
              </p>
            </div>
          </section>

          {janAushadhi && (
            <section className="info-card jan-aushadhi-card">
              <span className="eyebrow">
                Price insight
              </span>

              <h2>
                Jan Aushadhi option
              </h2>

              <p>
                {janAushadhi.genericName}
              </p>

              <div className="fact-grid">
                <div>
                  <span>
                    Official price
                  </span>

                  <strong>
                    {formatRupees(
                      janAushadhi.officialPrice,
                    )}
                  </strong>
                </div>

                {hasSaving && (
  <>
    <div>
      <span>
        You could save
      </span>

      <strong>
        {formatRupees(
          savingAmount,
        )}
      </strong>
    </div>

    <div>
      <span>
        Saving
      </span>

      <strong>
        {savingPercent}%
      </strong>
    </div>
  </>
)}

{janAushadhiIsMoreExpensive && (
  <div>
    <span>
      Price difference
    </span>

    <strong>
      +{formatRupees(extraCost)}
    </strong>
  </div>
)}

{hasSamePrice && (
  <div>
    <span>
      Price difference
    </span>

    <strong>
      Same price
    </strong>
  </div>
)}
              </div>
            </section>
          )}

          <section className="alternatives">
            <div className="section-row">
              <div>
                <span className="eyebrow">
                  Similar options
                </span>

                <h2>
                  Compare alternatives
                </h2>
              </div>

              <Link
                className="text-link"
                to={`/search?q=${encodeURIComponent(
                  medicine.name,
                )}`}
              >
                View all
                <ChevronRight size={16} />
              </Link>
            </div>

            {alternatives.map(
              (alternative, index) => (
                <Link
                  className="alternative-row"
                  to={`/medicine/${alternative.id}`}
                  key={alternative.id}
                >
                  <span className="alt-rank">
                    {String(index + 1).padStart(
                      2,
                      '0',
                    )}
                  </span>

                  <span
                    className="alt-pill"
                    style={{
                      background:
                        alternative.color,
                    }}
                  />

                  <span>
                    <strong>
                      {alternative.name}
                    </strong>

                    <small>
                      {alternative.manufacturer}
                    </small>
                  </span>

                  <span className="alt-price">
                    {formatRupees(
                      alternative.price,
                    )}
                  </span>

                  <ChevronRight size={17} />
                </Link>
              ),
            )}
          </section>
        </div>

        <aside className="detail-aside">
          <div className="aside-card">
            <span className="eyebrow">
              <Pill size={13} />
              Price comparison
            </span>

            <div className="price-bars">
              <div>
                <span>
                  {medicine.name}
                </span>

                <i>
                  <b
                    style={{
                      width: '100%',
                    }}
                  />
                </i>

                <strong>
                  {formatRupees(
                    medicine.price,
                  )}
                </strong>
              </div>

              {janAushadhi && (
                <div>
                  <span>
                    Jan Aushadhi
                  </span>

                  <i>
                    <b
                      className="generic-bar"
                      style={{
                        width: `${Math.max(
                          20,
                          (janAushadhi.officialPrice /
                            medicine.price) *
                            100,
                        )}%`,
                      }}
                    />
                  </i>

                  <strong>
                    {formatRupees(
                      janAushadhi.officialPrice,
                    )}
                  </strong>
                </div>
              )}
            </div>

            {hasSaving && (
  <div className="aside-savings">
    <Check size={16} />

    You could save{' '}

    <strong>
      {formatRupees(
        savingAmount,
      )}
    </strong>
  </div>
)}

{janAushadhiIsMoreExpensive && (
  <div className="aside-savings">
    Jan Aushadhi is{' '}

    <strong>
      {formatRupees(extraCost)}
    </strong>{' '}

    higher
  </div>
)}

{hasSamePrice && (
  <div className="aside-savings">
    Same price as Jan Aushadhi
  </div>
)}
          </div>

          <AIExplanation
            medicine={medicine}
          />
        </aside>
      </section>
    </PageTransition>
  )
}