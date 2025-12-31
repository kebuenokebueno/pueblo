import { configureStore } from '@reduxjs/toolkit'

import municipiosReducer from './municipiosSlice'
import entriesReducer from './entriesSlice'

export const makeStore = () =>
  configureStore({
    reducer: {
      municipios: municipiosReducer,
      entries: entriesReducer,
    },
  })

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']

