import { createSelector } from '@reduxjs/toolkit'

import type { RootState } from './index'

const selectMunicipiosState = (state: RootState) => state.municipios

export const selectMunicipios = createSelector(
  selectMunicipiosState,
  (municipios) => municipios.items
)

export const selectMunicipiosStatus = createSelector(
  selectMunicipiosState,
  (municipios) => municipios.status
)

export const selectMunicipiosError = createSelector(
  selectMunicipiosState,
  (municipios) => municipios.error
)

const selectEntriesState = (state: RootState) => state.entries

export const selectEntries = createSelector(
  selectEntriesState,
  (entries) => entries.items
)

export const selectEntriesStatus = createSelector(
  selectEntriesState,
  (entries) => entries.status
)

export const selectEntriesError = createSelector(
  selectEntriesState,
  (entries) => entries.error
)

