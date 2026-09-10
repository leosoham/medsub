import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Clock3, Search, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchMedicines, createMedicineId } from '../services/medicineService'

export default function SpotlightSearch({ compact = false, initial = '' }) {
  const [query, setQuery] = useState(initial)
  const [focused, setFocused] = useState(false)
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    setQuery(initial)
  }, [initial])

  useEffect(() => {
    const trimmedQuery = query.trim()

    if (!trimmedQuery) {
      setMatches([])
      setLoading(false)
      setError(false)
      return
    }

    let cancelled = false

    const timer = setTimeout(async () => {
      try {
        setLoading(true)
        setError(false)

        const results = await searchMedicines(trimmedQuery)

        if (!cancelled) {
          setMatches(results.slice(0, 5))
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Medicine search failed:', err)
          setMatches([])
          setError(true)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }, 250)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query])

  const submit = event => {
    event.preventDefault()

    const trimmedQuery = query.trim()

    if (!trimmedQuery) {
      navigate('/search')
      return
    }

    navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`)
  }

  const openMedicine = medicineName => {
    navigate(`/medicine/${createMedicineId(medicineName)}`)
  }

  return (
    <div className={`spotlight ${compact ? 'compact' : ''}`}>
      <form
        onSubmit={submit}
        className={`spotlight-input ${focused ? 'focused' : ''}`}
      >
        <Search size={compact ? 18 : 21} strokeWidth={2.2} />

        <input
          value={query}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          onChange={event => setQuery(event.target.value)}
          placeholder="Search a medicine or composition"
          aria-label="Search medicine"
        />

        <kbd>⌘ K</kbd>

        <button type="submit" aria-label="Search">
          <ArrowRight size={18} />
        </button>
      </form>

      <AnimatePresence>
        {focused && (
          <motion.div
            className="search-popover"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
          >
            {query.trim() ? (
              <>
                <span className="popover-label">Matches</span>

                {loading && (
                  <div className="search-state">
                    Searching medicines…
                  </div>
                )}

                {!loading && error && (
                  <div className="search-state">
                    Unable to search right now. Please try again.
                  </div>
                )}

                {!loading && !error && matches.length === 0 && (
                  <div className="search-state">
                    No medicines found.
                  </div>
                )}

                {!loading &&
                  !error &&
                  matches.map(medicine => (
                    <button
                      key={medicine.medicine_name}
                      type="button"
                      onMouseDown={() =>
                        openMedicine(medicine.medicine_name)
                      }
                    >
                      <span className="mini-pill" />

                      <span>
                        <strong>{medicine.medicine_name}</strong>
                        <small>Medicine</small>
                      </span>

                      <ArrowRight size={15} />
                    </button>
                  ))}
              </>
            ) : (
              <>
                <span className="popover-label">
                  <Clock3 size={13} />
                  Recent searches
                </span>

                {[
                  'Dolo 650 Tablet',
                  'Pantocid 40',
                  'Azithral 500',
                ].map((item, index) => (
                  <button
                    key={item}
                    type="button"
                    onMouseDown={() => setQuery(item)}
                  >
                    <span className="recent-dot">{index + 1}</span>

                    <span>
                      <strong>{item}</strong>
                      <small>Search medicine</small>
                    </span>

                    <ArrowRight size={15} />
                  </button>
                ))}

                <span className="popover-label popular">
                  <Sparkles size={13} />
                  Popular today
                </span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
