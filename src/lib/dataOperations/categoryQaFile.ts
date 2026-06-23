import type { PrimarySegment, ProviderRaw } from '../../types/provider'

export interface CategoryQaPatch {
  curated_public_categories: PrimarySegment[]
  construction_ready?: boolean
  wedding_friendly?: boolean
  oilfield_ready?: boolean
  septic_service?: boolean
  site_support?: boolean
  luxury_trailers?: boolean
  luxury_units?: boolean
  heated?: boolean
  winterized?: boolean
  handwash_available?: boolean
  ada_accessible?: boolean
  remote_logistics?: boolean
}

export interface CategoryQaFile {
  version: number
  entries: Array<{
    id: string
    patch: CategoryQaPatch
  }>
}

export function applyCategoryQaFile(
  rows: ProviderRaw[],
  file: CategoryQaFile | null,
): ProviderRaw[] {
  if (!file?.entries?.length) return rows
  const map = new Map(file.entries.map((e) => [e.id, e.patch]))
  return rows.map((row) => {
    const patch = map.get(row.id)
    if (!patch) return row
    const { curated_public_categories, ...flags } = patch
    return {
      ...row,
      curated_public_categories,
      ...flags,
    }
  })
}
