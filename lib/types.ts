export interface Municipio {
  id: number
  nombre: string | null
  provincia: string | null
  distancia_metros: number | null
  longitud: string | null
  latitud: string | null
}

export interface Entry {
  id: number
  entry_date: string
  title: string
  description: string
  municipio_id: string
}


