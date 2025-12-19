'use client'

import { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap, Circle, CircleMarker } from 'react-leaflet'
import L, { LatLngExpression } from 'leaflet'

import type { Municipio } from '@/lib/store/municipiosSlice'
import { storageGet } from '@/lib/platform/storage'
import { LOCATION_KEY } from '@/lib/locationStorage'

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

  const getFirstString = (obj: Record<string, unknown>, keys: string[]): string | null => {
    for (const key of keys) {
      const value = obj[key]
      if (typeof value === 'string') return value
      if (typeof value === 'number') return String(value)
    }
    return null
  }

  const parseLat = (raw: string | null) => {
    const n = parseCoordinate(raw)
    if (n === null) return null
    return n >= -90 && n <= 90 ? n : null
  }

  const parseLng = (raw: string | null) => {
    const n = parseCoordinate(raw)
    if (n === null) return null
    return n >= -180 && n <= 180 ? n : null
  }

  const markers = useMemo(() => {
    return municipios
      .map((municipio) => {
        const asRecord = municipio as unknown as Record<string, unknown>
        const lat = parseLat(
          getFirstString(asRecord, [
            'latitud_etrs89',
            'latitud',
            'latitude',
            'lat',
          ])
        )
        const lng = parseLng(
          getFirstString(asRecord, [
            'longitud_etrs89',
            'longitud',
            'longitude',
            'lon',
            'lng',
          ])
        )

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

  const center = (() => {
    try {
      const positions = markers.map((m) => m.position as [number, number])
      const total = positions.length
      const [sumLat, sumLng] = positions.reduce(
        (acc, [lat, lng]) => [acc[0] + lat, acc[1] + lng],
        [0, 0]
      )
      return [sumLat / total, sumLng / total] as LatLngExpression
    } catch {
      return markers[0]?.position ?? DEFAULT_CENTER
    }
  })()

  const FitBounds = ({ points }: { points: Array<[number, number]> }) => {
    const map = useMap()
    useMemo(() => {
      if (points.length === 0) return
      const bounds = L.latLngBounds(points.map((p) => L.latLng(p[0], p[1])))
      map.fitBounds(bounds, { padding: [32, 32] })
    }, [map, points])
    return null
  }

  const CurrentLocationLayer = ({ points }: { points: Array<[number, number]> }) => {
    const map = useMap()
    const [pos, setPos] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null)
    const puckIcon = useMemo(
      () =>
        L.divIcon({
          className: '',
          iconSize: [20, 28],
          iconAnchor: [10, 18],
          html: `
            <div style="position:relative;width:20px;height:28px;">
              <div style="
                position:absolute;
                left:50%;
                top:18px;
                transform:translate(-50%,-50%);
                width:14px;height:14px;border-radius:50%;
                background:#2563F6;border:3px solid #ffffff;
                box-shadow:0 6px 12px rgba(37,99,235,0.35);
              "></div>
            </div>`,
        }),
      []
    )
    useEffect(() => {
      let cancelled = false
      const load = async () => {
        try {
          const raw = await storageGet(LOCATION_KEY)
          if (raw) {
            const parsed = JSON.parse(raw) as { lat?: unknown; lng?: unknown }
            const lat = typeof parsed.lat === 'number' ? parsed.lat : Number(parsed.lat)
            const lng = typeof parsed.lng === 'number' ? parsed.lng : Number(parsed.lng)
            if (Number.isFinite(lat) && Number.isFinite(lng)) {
              setPos({ lat, lng } as any)
              return
            }
          }
        } catch {}
      }
      load()
      return () => {
        cancelled = true
      }
    }, [])
    useEffect(() => {
      if (!pos) return
      const all = [...points, [pos.lat, pos.lng] as [number, number]]
      const bounds = L.latLngBounds(all.map((p) => L.latLng(p[0], p[1])))
      map.fitBounds(bounds, { padding: [32, 32] })
    }, [map, pos, points])
    if (!pos) return null
    return <Marker position={[pos.lat, pos.lng]} icon={puckIcon} interactive={false} />
  }

  const formatDistanceKm = (value: unknown): string => {
    const n = typeof value === 'number' ? value : Number(value)
    if (!Number.isFinite(n)) return 'N/D'
    const km = Math.floor(n / 1000)
    return String(km)
  }

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
      <FitBounds points={markers.map((m) => m.position as [number, number])} />
      <CurrentLocationLayer points={markers.map((m) => m.position as [number, number])} />
      {markers.map(({ municipio, position }) => (
        <Marker key={municipio.id} position={position} icon={markerIcon}>
          <Popup>
            <div className="flex flex-col gap-1">
                <span className="text-sm text-zinc-900 dark:text-zinc-100">
                  <span className="font-semibold">Municipio:</span>{' '}
                  {municipio.nombre ?? 'N/D'}
                </span>
                <span className="text-sm text-zinc-700 dark:text-zinc-300">
                  <span className="font-semibold">Provincia:</span>{' '}
                  {municipio.provincia ?? 'N/D'}
                </span>
                <span className="text-sm text-zinc-700 dark:text-zinc-300">
                  <span className="font-semibold">Distancia:</span>{' '}
                  {formatDistanceKm(municipio.distancia_metros)} km
                </span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

