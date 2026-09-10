import { AnimatePresence, motion } from 'framer-motion'
import {
  Grid2X2,
  List,
  SearchX,
  SlidersHorizontal,
  Stethoscope,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import MedicineCard from '../components/MedicineCard'
import JanAushadhiCard from '../components/JanAushadhiCard'
import PageTransition from '../components/PageTransition'
import SpotlightSearch from '../components/SpotlightSearch'

import {
  getMedicineSubstitutes,
  normalizeSubstitutionResponse,
} from '../services/medicineService'

const symptoms = [
  'Fever',
  'Headache',
  'Acidity',
  'Allergy',
  'Diabetes',
  'High cholesterol',
]

export default function Search({
  symptomMode = false,
}) {
  const [params] = useSearchParams()

  const query = params.get('q') || ''

  const [view, setView] = useState('grid')
  const [selected, setSelected] = useState([])

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [sort, setSort] = useState('price_low')
  const [manufacturer, setManufacturer] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    if (!query || symptomMode) {
      setData(null)
      return
    }

    let cancelled = false

    async function loadResults() {
      try {
        setLoading(true)
        setError('')

        // Clear the previous medicine immediately.
        // This prevents stale medicine information
        // from remaining visible while the new request loads.
        setData(null)

        const response =
          await getMedicineSubstitutes(
            query,
            {
              sort,
              manufacturer,
              minPrice,
              maxPrice,
            },
          )

        if (!cancelled) {
          setData(
            normalizeSubstitutionResponse(response),
          )
        }
      } catch (err) {
        if (!cancelled) {
          console.error(
            'Failed to load medicine results:',
            err,
          )

          setData(null)
          setError(
            'We could not load medicine options right now.',
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadResults()

    return () => {
      cancelled = true
    }
  }, [
    query,
    symptomMode,
    sort,
    manufacturer,
    minPrice,
    maxPrice,
  ])

  const results = data?.substitutes ?? []

  const toggle = medicine => {
    setSelected(current =>
      current.some(item => item.id === medicine.id)
        ? current.filter(item => item.id !== medicine.id)
        : [...current, medicine].slice(-3),
    )
  }

  const searchedMedicine =
    data?.searchedMedicine

  return (
    <PageTransition className="search-page page-width">
      <section className="search-header">
        <span className="eyebrow">
          {symptomMode ? (
            <>
              <Stethoscope size={14} />
              Search by symptoms
            </>
          ) : (
            'Medicine search'
          )}
        </span>

        <h1>
          Find your medicine.
          <br />
          <em>Understand your options.</em>
        </h1>

        <p>
          Search by medicine name to explore
          equivalent choices and compare prices.
        </p>
      </section>

      {!symptomMode && (
        <SpotlightSearch
          compact
          initial={query}
        />
      )}

      {symptomMode && (
        <div className="symptom-picker">
          {symptoms.map(symptom => (
            <button
              key={symptom}
              type="button"
            >
              {symptom}
            </button>
          ))}
        </div>
      )}

      {query && searchedMedicine && (
        <section className="searched-medicine-summary">
          <span className="eyebrow">
            Selected medicine
          </span>

          <h2>
            {searchedMedicine.name}
          </h2>

          <p>
            {searchedMedicine.composition}
          </p>

          <div className="searched-medicine-meta">
  <span>
    {searchedMedicine.manufacturer}
  </span>

  <span className="meta-separator">·</span>

  <span>
    {searchedMedicine.dosageForm}
  </span>

  <span className="meta-separator">·</span>

  <strong>
    ₹{searchedMedicine.price}
  </strong>
</div>
        </section>
      )}

      <div className="results-toolbar">
        <span>
          {loading
            ? 'Finding options…'
            : `${results.length} alternatives`}
        </span>

        <div>
          <button
            type="button"
            className="filter-button"
            onClick={() =>
              setFiltersOpen(open => !open)
            }
          >
            <SlidersHorizontal size={15} />
            Filters
          </button>

          <div className="view-switch">
            <button
              type="button"
              aria-label="Grid view"
              className={
                view === 'grid'
                  ? 'active'
                  : ''
              }
              onClick={() =>
                setView('grid')
              }
            >
              <Grid2X2 size={16} />
            </button>

            <button
              type="button"
              aria-label="List view"
              className={
                view === 'list'
                  ? 'active'
                  : ''
              }
              onClick={() =>
                setView('list')
              }
            >
              <List size={17} />
            </button>
          </div>
        </div>
      </div>

      {filtersOpen && (
        <motion.section
          className="search-filters"
          initial={{
            opacity: 0,
            height: 0,
          }}
          animate={{
            opacity: 1,
            height: 'auto',
          }}
          exit={{
            opacity: 0,
            height: 0,
          }}
        >
          <label>
            Manufacturer
            <input
              value={manufacturer}
              onChange={event =>
                setManufacturer(
                  event.target.value,
                )
              }
              placeholder="e.g. Cipla"
            />
          </label>

          <label>
            Minimum price
            <input
              type="number"
              min="0"
              value={minPrice}
              onChange={event =>
                setMinPrice(
                  event.target.value,
                )
              }
              placeholder="₹0"
            />
          </label>

          <label>
            Maximum price
            <input
              type="number"
              min="0"
              value={maxPrice}
              onChange={event =>
                setMaxPrice(
                  event.target.value,
                )
              }
              placeholder="₹100"
            />
          </label>

          <label>
            Sort
            <select
              value={sort}
              onChange={event =>
                setSort(event.target.value)
              }
            >
              <option value="price_low">
                Price: Low to High
              </option>

              <option value="price_high">
                Price: High to Low
              </option>

              <option value="name">
                Name
              </option>
            </select>
          </label>
        </motion.section>
      )}

      {loading && (
        <div className="empty-state">
          <h2>Finding alternatives…</h2>
          <p>
            Comparing available medicine
            options.
          </p>
        </div>
      )}

      {!loading && error && (
        <div className="empty-state">
          <SearchX size={31} />

          <h2>
            Something went wrong
          </h2>

          <p>{error}</p>
        </div>
      )}

      {!loading &&
        !error &&
        query &&
        !data && (
          <div className="empty-state">
            <SearchX size={31} />

            <h2>
              Medicine not found
            </h2>

            <p>
              Try searching for another
              medicine.
            </p>
          </div>
        )}

      {!loading &&
        !error &&
        data &&
        results.length === 0 && (
          <div className="empty-state">
            <SearchX size={31} />

            <h2>
              No alternatives found
            </h2>

            <p>
              We couldn't find priced
              alternatives for this medicine.
            </p>
          </div>
        )}

{!loading &&
  !error &&
  results.length > 0 && (
    <>
      {data?.janAushadhi && (
        <JanAushadhiCard
          option={data.janAushadhi}
        />
      )}

      <motion.div
        layout
        className={`medicine-grid ${view}`}
      >
        {results.map(medicine => (
          <MedicineCard
            key={medicine.id}
            medicine={medicine}
            view={view}
            selected={selected.some(
              item =>
                item.id === medicine.id,
            )}
            onSelect={toggle}
          />
        ))}
      </motion.div>

    </>
  )}

      <AnimatePresence>
        {selected.length > 0 && (
          <motion.div
            className="compare-dock"
            initial={{
              y: 90,
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            exit={{
              y: 90,
              opacity: 0,
            }}
          >
            <span>
              {selected.length}{' '}
              {selected.length === 1
                ? 'medicine'
                : 'medicines'}{' '}
              selected
            </span>

            <button type="button">
              Compare now
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  )
}