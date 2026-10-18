
import {
    ArrowLeft,
    CircleAlert,
    GitCompareArrows,
    Pill,
  } from 'lucide-react'
  import { Link } from 'react-router-dom'
  import { useEffect, useState } from 'react'
  import { useComparison } from '../context/ComparisonContext'
  
  import MedicineCapsule from '../components/MedicineCapsule'
  import PageTransition from '../components/PageTransition'
  
  import {
    getMedicineSubstitutes,
    normalizeSubstitutionResponse,
  } from '../services/medicineService'
  
  import { formatRupees } from '../utils/formatters'
  
  function formatValue(value) {
    return value || 'Information unavailable'
  }
  
  function MedicineComparison({ data, onRemove }) {
    const medicine = data.searchedMedicine
    const janAushadhi = data.janAushadhi
  
    return (
      <section className="comparison-column">
        <div
          className="comparison-medicine-hero"
          style={{ '--med-color': '#8EADED' }}
        >
          <MedicineCapsule
            color="#8EADED"
            size="medium"
          />
          <span className="eyebrow">Medicine profile</span>
          <h2>{medicine.name}</h2>
          <p>{formatValue(medicine.manufacturer)}</p>
        </div>
  
        <div className="comparison-price">
          <span>Current medicine price</span>
          <strong>{formatRupees(medicine.price)}</strong>
        </div>
  
        <div className="comparison-row">
          <span>Composition</span>
          <p>{formatValue(medicine.composition)}</p>
        </div>
  
        <div className="comparison-row">
          <span>Dosage form</span>
          <p>{formatValue(medicine.dosageForm)}</p>
        </div>
  
        <div className="comparison-row">
          <span>Manufacturer</span>
          <p>{formatValue(medicine.manufacturer)}</p>
        </div>
  
        <div className="comparison-row">
          <span>Uses</span>
          <p>{formatValue(medicine.uses)}</p>
        </div>
  
        <div className="comparison-row">
          <span>Side effects</span>
          <p>{formatValue(medicine.sideEffects)}</p>
        </div>
  
        <div className="comparison-row">
          <span>Jan Aushadhi generic</span>
          <p>
            {formatValue(janAushadhi?.genericName)}
          </p>
        </div>
  
        <div className="comparison-row">
          <span>Jan Aushadhi official price</span>
          <p>
            {janAushadhi?.officialPrice != null
              ? formatRupees(janAushadhi.officialPrice)
              : 'Price unavailable'}
          </p>
        </div>
  
        <Link
          className="button button-outline small comparison-details-link"
          to={`/medicine/${medicine.id}`}
        >
          View full details
        </Link>
        <button
  className="button button-outline small"
  type="button"
  onClick={onRemove}
>
  Remove from comparison
</button>
      </section>
    )
  }
  
  export default function Compare() {
    const {
      selectedMedicines: medicines,
      toggleMedicine,
    } = useComparison()
    const [comparisonData, setComparisonData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [retryCount, setRetryCount] = useState(0)
  
    useEffect(() => {
      let cancelled = false
  
      async function loadComparison() {
        if (medicines.length !== 2) {
          setComparisonData([])
          setLoading(false)
          return
        }
  
        try {
          setLoading(true)
          setError('')
  
          const responses = await Promise.all(
            medicines.map(async medicine => {
              const response = await getMedicineSubstitutes(
                medicine.name,
              )
  
              return normalizeSubstitutionResponse(response)
            }),
          )
  
          if (!cancelled) {
            setComparisonData(responses)
          }
        } catch (err) {
          console.error('Failed to compare medicines:', err)
  
          if (!cancelled) {
            setError(
              'We could not load both medicine profiles. Please try again.',
            )
          }
        } finally {
          if (!cancelled) {
            setLoading(false)
          }
        }
      }
  
      loadComparison()
  
      return () => {
        cancelled = true
      }
    }, [medicines, retryCount])
  
    if (medicines.length !== 2) {
      return (
        <PageTransition className="compare-page page-width">
          <Link className="back-link" to="/search">
            <ArrowLeft size={16} />
            Back to search
          </Link>
  
          <div className="empty-state">
            <GitCompareArrows size={31} />
            <h2>Select two medicines to compare</h2>
            <p>
  Return to search to select two medicines.
  Your remaining selection will be preserved.
</p>
          </div>
        </PageTransition>
      )
    }
  
    return (
      <PageTransition className="compare-page page-width">
        <Link className="back-link" to="/search">
          <ArrowLeft size={16} />
          Back to search
        </Link>
  
        <header className="compare-heading">
          <span className="eyebrow">
            <Pill size={14} />
            Medicine comparison
          </span>
          <h1>Compare medicines.</h1>
          <p>
            Review prices, composition, uses, and
            available Jan Aushadhi pricing side by side.
          </p>
        </header>
  
        {loading && (
          <div className="empty-state">
            <h2>Loading medicine profiles…</h2>
            <p>Getting details for both medicines.</p>
          </div>
        )}
  
        {!loading && error && (
          <div className="empty-state">
            <CircleAlert size={31} />
            <h2>Comparison unavailable</h2>
            <p>{error}</p>
            <button
  className="button button-outline"
  type="button"
  onClick={() => setRetryCount(count => count + 1)}
>
  Try again
</button>
          </div>
        )}
  
        {!loading &&
          !error &&
          comparisonData.length === 2 && (
            <div className="comparison-grid">
              {comparisonData.map((data, index) => (
  <MedicineComparison
    key={medicines[index].id}
    data={data}
    onRemove={() => toggleMedicine(medicines[index])}
  />
))}
            </div>
          )}
      </PageTransition>
    )
  }
  