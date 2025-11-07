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

