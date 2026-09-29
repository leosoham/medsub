import { AnimatePresence, motion } from 'framer-motion'
import { Bot, CheckCircle2, Sparkles, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getMedicineExplanation } from '../services/medicineService'

export default function AIExplanation({ medicine }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [explanation, setExplanation] = useState('')
  const [error, setError] = useState('')

  const activate = async () => {
    setOpen(true)
    setLoading(true)
    setExplanation('')
    setError('')

    try {
      const data = await getMedicineExplanation(
        medicine.name,
      )

      if (!data?.explanation) {
        throw new Error('Explanation was not returned')
      }

      setExplanation(data.explanation)
    } catch (err) {
      console.error('Medicine explanation failed:', err)

      setError(
        'We could not generate an explanation right now. Please try again in a moment.',
      )
    } finally {
      setLoading(false)
    }
  }

  const close = () => {
    setOpen(false)
  }

  useEffect(() => {
    if (!open) {
      setLoading(false)
    }
  }, [open])

  return (
    <>
      <button className="ai-trigger" onClick={activate}>
        <Sparkles size={16} />
        Explain this recommendation
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="ai-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          >
            <motion.div
              className="ai-panel"
              initial={{
                opacity: 0,
                y: 24,
                scale: 0.97,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 20,
                scale: 0.97,
              }}
              onClick={event =>
                event.stopPropagation()
              }
            >
              <button
                className="close-panel"
                onClick={close}
                aria-label="Close explanation"
              >
                <X size={18} />
              </button>

              <div className="ai-orb">
                <Bot size={23} />
                <i />
              </div>

              <span className="eyebrow">
                <Sparkles size={13} />
                GenericX explanation
              </span>

              <h2>
                {loading
                  ? 'Looking at the details…'
                  : error
                    ? 'We could not generate the explanation.'
                    : 'The essentials, in plain English.'}
              </h2>

              {loading && (
                <div className="typing-lines">
                  <i />
                  <i />
                  <i />
                </div>
              )}

{!loading && error && (
  <div className="ai-answer">
    <p>{error}</p>

    <div>
      <CheckCircle2 size={17} />
      <span>
        The medicine information above is still
        available for you to review.
      </span>
    </div>

    <button
      type="button"
      className="ai-retry"
      onClick={activate}
    >
      Try again
    </button>
  </div>
)}

              {!loading && !error && explanation && (
                <div className="ai-answer">
                  <p>{explanation}</p>

                  <div>
                    <CheckCircle2 size={17} />
                    <span>
                      This explanation is generated from the
                      medicine information available in the
                      system.
                    </span>
                  </div>

                  <div>
                    <CheckCircle2 size={17} />
                    <span>
                      A pharmacist or clinician can help you
                      make the right choice.
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}