import { configureStore } from '@reduxjs/toolkit'

import municipiosReducer from './municipiosSlice'

export const makeStore = () =>
  configureStore({
    reducer: {
      municipios: municipiosReducer,
    },
  })

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']

