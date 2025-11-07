'use client'

import { useMemo } from 'react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import L, { LatLngExpression } from 'leaflet'

import type { Municipio } from '@/lib/store/municipiosSlice'

type MunicipiosMapProps = {
  municipios: Municipio[]
}

const DEFAULT_CENTER: LatLngExpression = [40.4168, -3.7038]

const createDefaultIcon = () =>
  L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  })

const parseCoordinate = (value: string | null) => {
  if (!value) return null
  const normalized = value.replace(',', '.').trim()
  if (!normalized) return null

  const numericValue = Number(normalized)
  return Number.isFinite(numericValue) ? numericValue : null
}

export default function MunicipiosMap({ municipios }: MunicipiosMapProps) {
  const markerIcon = useMemo(() => createDefaultIcon(), [])

  const markers = useMemo(() => {
    return municipios
      .map((municipio) => {
        const lat = parseCoordinate(municipio.LATITUD_ETRS89)
        const lng = parseCoordinate(municipio.LONGITUD_ETRS89)

        if (Number.isNaN(lat) || Number.isNaN(lng) || lat === null || lng === null) {
          return null
        }

        return {
          municipio,
          position: [lat, lng] as LatLngExpression,
        }
      })
      .filter((value): value is { municipio: Municipio; position: LatLngExpression } => value !== null)
  }, [municipios])

  if (markers.length === 0) {
    return (
      <div className="flex flex-col items-start justify-center gap-2 rounded-2xl border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
        <p>No hay municipios con coordenadas para mostrar en el mapa.</p>
      </div>
    )
  }

  const center = markers[0]?.position ?? DEFAULT_CENTER

  return (
    <MapContainer
      center={center}
      zoom={6}
      scrollWheelZoom
      style={{ height: '420px', width: '100%', borderRadius: '1rem' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map(({ municipio, position }) => (
        <Marker key={municipio.id} position={position} icon={markerIcon}>
          <Popup>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold">{municipio.NOMBRE_ACTUAL}</span>
              <span className="text-xs text-zinc-600 dark:text-zinc-400">
                Provincia: {municipio.PROVINCIA ?? 'Desconocida'}
              </span>
              <span className="text-xs text-zinc-600 dark:text-zinc-400">
                Habitantes: {municipio.POBLACION_MUNI ?? 'N/D'}
              </span>
              <span className="text-xs text-zinc-600 dark:text-zinc-400">
                Código INE: {municipio.COD_INE ?? 'N/D'}
              </span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

