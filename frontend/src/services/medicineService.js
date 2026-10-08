import axios from 'axios'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
  },
})

export async function searchMedicines(query) {
  const trimmedQuery = query.trim()

  if (!trimmedQuery) {
    return []
  }

  const response = await api.get('/search/', {
    params: {
      q: trimmedQuery,
    },
  })

  return response.data
}

export async function searchMedicinesBySymptoms(query) {
  const trimmedQuery = query.trim()

  if (!trimmedQuery) {
    return []
  }

  const response = await api.get('/symptom-search/', {
    params: {
      q: trimmedQuery,
    },
  })

  return response.data
}

export async function getMedicineSubstitutes(
  medicineName,
  filters = {},
) {
  if (!medicineName) {
    throw new Error('Medicine name is required')
  }

  const response = await api.get(
    `/substitutes/${encodeURIComponent(medicineName)}/`,
    {
      params: {
        ...(filters.manufacturer && {
          manufacturer: filters.manufacturer,
        }),

        ...(filters.dosageForm && {
          dosage_form: filters.dosageForm,
        }),

        ...(filters.minPrice !== '' &&
          filters.minPrice !== undefined && {
            min_price: filters.minPrice,
          }),

        ...(filters.maxPrice !== '' &&
          filters.maxPrice !== undefined && {
            max_price: filters.maxPrice,
          }),

        ...(filters.sort && {
          sort: filters.sort,
        }),
      },
    },
  )

  return response.data
}

export function normalizeSubstitute(
  substitute,
  index = 0,
) {
  const savingPercent = substitute.saving_percent
    ? Number.parseFloat(
        String(substitute.saving_percent).replace('%', ''),
      )
    : 0

  return {
    id: encodeURIComponent(substitute.medicine_name),
    name: substitute.medicine_name,
    manufacturer: substitute.manufacturer,
    dosageForm: substitute.dosage_form,
    price: substitute.price,
    amountSaved: substitute.amount_saved,
    savingPercent: savingPercent,
    uses: substitute.uses,
    sideEffects: substitute.side_effects,

    // Visual-only value for the existing GenericX capsule.
    // This is NOT medical data.
    color: [
      '#F1A594',
      '#8EADED',
      '#BEA3E5',
      '#91C8B1',
      '#E3BD81',
      '#83C6D6',
    ][index % 6],
  }
}

export function normalizeSymptomResult(
  medicine,
  index = 0,
) {
  return {
    id: createMedicineId(medicine.medicine_name),
    name: medicine.medicine_name,
    manufacturer: medicine.manufacturer,
    dosageForm: medicine.dosage_form,
    price: medicine.price,
    savingPercent: 0,
    uses: medicine.uses,
    sideEffects: medicine.side_effects,
    distance: medicine.distance,

    // Visual-only value for the existing GenericX capsule.
    // This is NOT medical data.
    color: [
      '#F1A594',
      '#8EADED',
      '#BEA3E5',
      '#91C8B1',
      '#E3BD81',
      '#83C6D6',
    ][index % 6],
  }
}

export function normalizeSearchedMedicine(
  medicine,
) {
  if (!medicine) {
    return null
  }

  return {
    id: encodeURIComponent(medicine.medicine_name),
    name: medicine.medicine_name,
    manufacturer: medicine.manufacturer,
    dosageForm: medicine.dosage_form,
    price: medicine.price,
    composition: medicine.composition,
    uses: medicine.uses,
    sideEffects: medicine.side_effects,
  }
}

export function normalizeSubstitutionResponse(data) {
  return {
    searchedMedicine: normalizeSearchedMedicine(
      data?.searched_medicine,
    ),

    janAushadhi: data?.jan_aushadhi
      ? {
          genericName: data.jan_aushadhi.generic_name,
          officialPrice: data.jan_aushadhi.official_price,
          amountSaved: data.jan_aushadhi.amount_saved,
          savingPercent: data.jan_aushadhi.saving_percent
            ? Number.parseFloat(
                String(data.jan_aushadhi.saving_percent).replace('%', ''),
              )
            : 0,
        }
      : null,

    totalSubstitutes: data?.total_substitutes ?? 0,

    substitutes: (data?.substitutes ?? []).map(
      normalizeSubstitute,
    ),
  }
}

export function createMedicineId(medicineName) {
  return encodeURIComponent(medicineName)
}

export function getMedicineNameFromId(id) {
  return decodeURIComponent(id)
}

export async function getMedicineExplanation(medicineName) {
  if (!medicineName) {
    throw new Error('Medicine name is required')
  }

  const response = await api.get(
    `/explain/${encodeURIComponent(medicineName)}/`,
    {
      timeout: 10000,
    },
  )

  return response.data
}
