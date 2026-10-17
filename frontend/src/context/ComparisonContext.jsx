
import { createContext, useContext, useState } from 'react'

const ComparisonContext = createContext(null)

export function ComparisonProvider({ children }) {
  const [selectedMedicines, setSelectedMedicines] = useState([])

  const toggleMedicine = medicine => {
    setSelectedMedicines(current => {
      const alreadySelected = current.some(
        item => item.id === medicine.id,
      )

      if (alreadySelected) {
        return current.filter(item => item.id !== medicine.id)
      }

      if (current.length >= 2) {
        return current
      }

      return [...current, medicine]
    })
  }

  const clearSelectedMedicines = () => {
    setSelectedMedicines([])
  }

  return (
    <ComparisonContext.Provider
      value={{
        selectedMedicines,
        toggleMedicine,
        clearSelectedMedicines,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  )
}

export function useComparison() {
  const context = useContext(ComparisonContext)

  if (!context) {
    throw new Error(
      'useComparison must be used inside ComparisonProvider',
    )
  }

  return context
}
