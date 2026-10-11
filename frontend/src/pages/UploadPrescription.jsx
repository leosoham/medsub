
import { AnimatePresence, motion } from 'framer-motion'
import {
  CheckCircle2,
  FileText,
  ScanLine,
  ShieldCheck,
  Upload,
  X,
  AlertCircle,
  ArrowRight,
  LoaderCircle,
} from 'lucide-react'
import { useRef, useState } from 'react'
import PageTransition from '../components/PageTransition'
import MedicineCard from '../components/MedicineCard'
import {
  uploadPrescription,
  confirmPrescriptionMedicine,
  normalizeSubstitutionResponse,
} from '../services/medicineService'
import { formatRupees } from '../utils/formatters'

const MAX_PDF_SIZE = 10 * 1024 * 1024

export default function UploadPrescription() {
  const input = useRef(null)

  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [uploadResult, setUploadResult] = useState(null)
  const [selectedMedicines, setSelectedMedicines] = useState({})
  const [results, setResults] = useState({})
  const [confirmingId, setConfirmingId] = useState(null)

  function selectFile(nextFile) {
    setError('')
    setUploadResult(null)
    setSelectedMedicines({})
    setResults({})

    if (!nextFile) {
      setFile(null)
      setStatus('idle')
      return
    }

    if (
      !nextFile.name.toLowerCase().endsWith('.pdf') ||
      nextFile.type && nextFile.type !== 'application/pdf'
    ) {
      setFile(null)
      setStatus('idle')
      setError('Please choose a digital prescription PDF file.')
      return
    }

    if (nextFile.size > MAX_PDF_SIZE) {
      setFile(null)
      setStatus('idle')
      setError('The PDF must be 10 MB or smaller.')
      return
    }

    setFile(nextFile)
    setStatus('ready')
  }

  async function processPrescription() {
    if (!file || status === 'processing') return

    setStatus('processing')
    setError('')
    setUploadResult(null)
    setSelectedMedicines({})
    setResults({})

    try {
      const data = await uploadPrescription(file)
      setUploadResult(data)
      setStatus('complete')

      if (!data.medicines?.length) {
        setError(
          data.message ||
            'No medicine candidates were found in this PDF.',
        )
      }
    } catch (err) {
      setStatus('ready')
      setError(
        err.response?.data?.error ||
          err.response?.data?.detail ||
          err.response?.data?.message ||
          err.message ||
          'Unable to process the prescription.',
      )
    }
  }

  function chooseCandidate(lineIndex, candidateId) {
    setSelectedMedicines(previous => ({
      ...previous,
      [lineIndex]: candidateId,
    }))
  }

  async function confirmMedicine(lineIndex) {
    const medicineId = selectedMedicines[lineIndex]

    if (!medicineId || confirmingId !== null) return

    setConfirmingId(lineIndex)
    setError('')

    try {
      const response =
        await confirmPrescriptionMedicine(medicineId)

      const raw = response.substitution_data

      setResults(previous => ({
        ...previous,
        [lineIndex]: normalizeSubstitutionResponse(raw),
      }))
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.detail ||
          err.response?.data?.message ||
          err.message ||
          'Unable to retrieve substitution data.',
      )
    } finally {
      setConfirmingId(null)
    }
  }

  function resetPage() {
    setFile(null)
    setStatus('idle')
    setError('')
    setUploadResult(null)
    setSelectedMedicines({})
    setResults({})
    setConfirmingId(null)

    if (input.current) input.current.value = ''
  }

  return (
    <PageTransition className="upload-page page-width">
      <section className="upload-heading">
        <span className="eyebrow">
          <ScanLine size={14} />
          Prescription upload
        </span>

        <h1>
          Let your prescription
          <br />
          <em>do the talking.</em>
        </h1>

        <p>
          Upload a digital prescription PDF to extract medicine
          names and explore database-listed alternatives.
          Please review every detected medicine before continuing.
        </p>
      </section>

      <section className="upload-shell">
        {status !== 'complete' ? (
          <>
            <div
              className={`drop-zone ${file ? 'has-file' : ''}`}
              onClick={() => input.current?.click()}
              onDragOver={event => event.preventDefault()}
              onDrop={event => {
                event.preventDefault()
                selectFile(event.dataTransfer.files?.[0])
              }}
              role="button"
              tabIndex={0}
              onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  input.current?.click()
                }
              }}
            >
              {file ? (
                <div className="file-selected">
                  <span className="file-thumb">
                    <FileText size={25} />
                  </span>

                  <div>
                    <strong>{file.name}</strong>
                    <small>
                      {(file.size / 1024).toFixed(1)} KB · PDF selected
                    </small>
                  </div>

                  <button
                    type="button"
                    aria-label="Remove selected PDF"
                    onClick={event => {
                      event.stopPropagation()
                      resetPage()
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <span className="upload-icon">
                    <Upload size={25} />
                  </span>

                  <h2>Drop your prescription PDF here</h2>
                  <p>
                    or <b>browse your files</b>
                  </p>
                  <small>Digital PDF only · up to 10 MB</small>
                </>
              )}

              <input
                ref={input}
                type="file"
                accept=".pdf,application/pdf"
                hidden
                onChange={event => {
                  selectFile(event.target.files?.[0])
                  event.target.value = ''
                }}
              />
            </div>

            {status === 'ready' && (
              <button
                type="button"
                className="button button-dark extract-button"
                onClick={processPrescription}
              >
                Extract medicines
                <ScanLine size={17} />
              </button>
            )}

            {status === 'processing' && (
              <div className="extracting">
                <span>
                  <LoaderCircle size={21} />
                </span>

                <div>
                  <strong>Reading your prescription</strong>
                  <p>
                    Extracting selectable text and matching database
                    entries…
                  </p>
                  <i>
                    <b />
                  </i>
                </div>
              </div>
            )}

            <div className="upload-assurance">
              <ShieldCheck size={18} />
              <span>
                The PDF is sent to the backend for processing.
                Avoid uploading files you are not authorized to share.
              </span>
            </div>
          </>
        ) : (
          <ExtractionResult
            data={uploadResult}
            selectedMedicines={selectedMedicines}
            results={results}
            confirmingId={confirmingId}
            onChoose={chooseCandidate}
            onConfirm={confirmMedicine}
            onReset={resetPage}
          />
        )}

        <AnimatePresence>
          {error && (
            <motion.div
              className="safety-note"
              role="alert"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ marginTop: 18 }}
            >
              <AlertCircle size={18} />
              <p>{error}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </PageTransition>
  )
}

function ExtractionResult({
  data,
  selectedMedicines,
  results,
  confirmingId,
  onChoose,
  onConfirm,
  onReset,
}) {
  const medicines = data?.medicines ?? []

  return (
    <motion.div
      className="extraction-result"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <span className="success-mark">
        <CheckCircle2 size={26} />
      </span>

      <span className="eyebrow">PDF processing complete</span>

      <h2>
        Found {medicines.length}{' '}
        {medicines.length === 1 ? 'medicine entry' : 'medicine entries'}
      </h2>

      <p>
        Choose the correct database match for each prescription
        entry. No candidate is automatically confirmed.
      </p>

      {data?.extracted_text && (
        <details
          style={{
            marginTop: 20,
            padding: 14,
            textAlign: 'left',
            border: '1px solid var(--line)',
            borderRadius: 12,
          }}
        >
          <summary style={{ cursor: 'pointer', fontSize: 12 }}>
            View extracted PDF text
          </summary>

          <pre
            style={{
              whiteSpace: 'pre-wrap',
              overflowWrap: 'anywhere',
              fontSize: 11,
              lineHeight: 1.6,
              color: 'var(--ink-soft)',
              marginBottom: 0,
            }}
          >
            {data.extracted_text}
          </pre>
        </details>
      )}

      <div
        className="extracted-list"
        style={{ marginTop: 24, textAlign: 'left' }}
      >
        {medicines.map((entry, lineIndex) => {
          const candidates = entry.candidates ?? []
          const selectedId = selectedMedicines[lineIndex]
          const selectedCandidate = candidates.find(
            candidate => String(candidate.id) === String(selectedId),
          )
          const result = results[lineIndex]

          return (
            <section
              key={`${lineIndex}-${entry.extracted_text}`}
              style={{
                padding: 16,
                borderBottom: '1px solid var(--line)',
              }}
            >
              <span className="eyebrow">
                Prescription entry {lineIndex + 1}
              </span>

              <h3
                style={{
                  margin: '8px 0',
                  fontSize: 15,
                  overflowWrap: 'anywhere',
                }}
              >
                {entry.extracted_text}
              </h3>

              {candidates.length === 0 ? (
                <p style={{ fontSize: 12, color: 'var(--muted)' }}>
                  No database candidates found. This entry needs
                  manual review.
                </p>
              ) : (
                <>
                  <label
                    htmlFor={`candidate-${lineIndex}`}
                    style={{
                      display: 'block',
                      margin: '12px 0 7px',
                      fontSize: 11,
                      color: 'var(--ink-soft)',
                    }}
                  >
                    Select the intended database medicine
                  </label>

                  <select
                    id={`candidate-${lineIndex}`}
                    value={selectedId ?? ''}
                    onChange={event =>
                      onChoose(lineIndex, event.target.value)
                    }
                    disabled={Boolean(result) || confirmingId !== null}
                    style={{
                      width: '100%',
                      padding: 12,
                      border: '1px solid var(--line)',
                      borderRadius: 10,
                      background: 'var(--paper)',
                      color: 'var(--ink)',
                    }}
                  >
                    <option value="">
                      Choose a medicine — no automatic selection
                    </option>

                    {candidates.map(candidate => (
                      <option
                        key={candidate.id}
                        value={candidate.id}
                      >
                        {candidate.medicine_name}
                        {' · '}
                        {candidate.composition || 'Composition unavailable'}
                        {' · '}
                        Match {candidate.match_score}%
                      </option>
                    ))}
                  </select>

                  {selectedCandidate && (
                    <div
                      style={{
                        marginTop: 12,
                        padding: 12,
                        background: 'var(--bg)',
                        borderRadius: 10,
                        fontSize: 11,
                        lineHeight: 1.7,
                      }}
                    >
                      <div>
                        <strong>Manufacturer:</strong>{' '}
                        {selectedCandidate.manufacturer || 'Unavailable'}
                      </div>
                      <div>
                        <strong>Strength/composition:</strong>{' '}
                        {selectedCandidate.composition || 'Unavailable'}
                      </div>
                      <div>
                        <strong>Listed price:</strong>{' '}
                        {selectedCandidate.price == null
                          ? 'Unavailable'
                          : formatRupees(selectedCandidate.price)}
                      </div>
                      <div>
                        <strong>Match score:</strong>{' '}
                        {selectedCandidate.match_score}%
                      </div>
                    </div>
                  )}

                  {!result && (
                    <button
                      type="button"
                      className="button button-dark"
                      disabled={!selectedId || confirmingId !== null}
                      onClick={() => onConfirm(lineIndex)}
                      style={{ marginTop: 12, width: '100%' }}
                    >
                      {confirmingId === lineIndex ? (
                        <>
                          Retrieving choices
                          <LoaderCircle size={16} />
                        </>
                      ) : (
                        <>
                          Confirm medicine and view choices
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  )}
                </>
              )}

              {result && (
                <div style={{ marginTop: 24, textAlign: 'left' }}>
                  <div className="safety-note">
                    <ShieldCheck size={18} />
                    <p>
                      Database results for your selected medicine.
                      Confirm the suitability of any alternative with
                      a qualified healthcare professional.
                    </p>
                  </div>

                  <h3 style={{ margin: '20px 0 6px', fontSize: 18 }}>
                    {result.searchedMedicine?.name ??
                      selectedCandidate?.medicine_name}
                  </h3>

                  {result.searchedMedicine?.composition && (
                    <p style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
                      {result.searchedMedicine.composition}
                    </p>
                  )}

                  {result.janAushadhi && (
                    <div className="jan-aushadhi-option">
                      <span className="eyebrow">Jan Aushadhi listing</span>
                      <h3 style={{ margin: '8px 0', fontSize: 17 }}>
                        {result.janAushadhi.genericName}
                      </h3>
                      <p style={{ marginBottom: 0, fontSize: 12 }}>
                        Listed price:{' '}
                        {formatRupees(result.janAushadhi.officialPrice)}
                      </p>
                      {result.janAushadhi.amountSaved != null && (
                        <p style={{ marginTop: 6, fontSize: 12 }}>
                          Database price difference:{' '}
                          {formatRupees(result.janAushadhi.amountSaved)}
                        </p>
                      )}
                    </div>
                  )}

                  <h4 style={{ margin: '22px 0 12px', fontSize: 14 }}>
                    Database-listed alternatives ({result.totalSubstitutes})
                  </h4>

                  {result.substitutes.length > 0 ? (
                    <div className="medicine-grid">
                      {result.substitutes.map(substitute => (
                        <MedicineCard
                          key={substitute.id}
                          medicine={substitute}
                          view="grid"
                        />
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: 12, color: 'var(--muted)' }}>
                      No alternatives were returned for this medicine.
                    </p>
                  )}
                </div>
              )}
            </section>
          )
        })}
      </div>

      <p
        style={{
          margin: '18px 0',
          fontSize: 11,
          color: 'var(--muted)',
          lineHeight: 1.6,
        }}
      >
        Matching scores indicate text similarity, not medical accuracy.
        The results are for review and do not replace a prescription or
        professional medical advice.
      </p>

      <button
        type="button"
        className="button button-outline"
        onClick={onReset}
      >
        Upload another prescription
      </button>
    </motion.div>
  )
}
