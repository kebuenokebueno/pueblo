'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Municipio } from '@/lib/store/municipiosSlice'
import { getPuebloClient } from "@/lib/supabase/client"
import { getStoredSelectedMunicipio } from '@/lib/selectedMunicipioStorage'
import { useAppDispatch } from '@/lib/store/hooks'
import { fetchEntries } from '@/lib/store/entriesSlice'

type Props = {
  open: boolean
  onClose: () => void
}

const isMobile = () => {
  if (typeof navigator === 'undefined') return false
  return /iphone|ipad|ipod|android|mobile/i.test(navigator.userAgent)
}

export default function EntryForm({ open, onClose }: Props) {
  const dispatch = useAppDispatch()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState<string>('')
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [place, setPlace] = useState<Municipio | null>(null)

  useEffect(() => {
    if (!open) return
    const loadPlace = async () => {
      const stored = await getStoredSelectedMunicipio()
      setPlace(stored)
    }
    loadPlace()
    
    const d = new Date()
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    setDate(`${y}-${m}-${dd}`)
    setTitle('')
    setDescription('')
    setFiles([])
  }, [open])

  const handleSubmit = async () => {
    if (!place?.id) {
      console.error('No municipio selected')
      return
    }

    // Convert date to UTC ISO string
    const dateObj = new Date(date + 'T00:00:00')
    const dateUtc = dateObj.toISOString()

    const payload = {
      title: title.trim(),
      description: description.trim(),
      entry_date: dateUtc,
      municipio_id: place.id.toString(),
    }

    const supabase = getPuebloClient()

    setLoading(true)
    try {

        const { error } = await supabase
            .rpc('insert_entry', {'title': payload.title,'description': payload.description,'entry_date': payload.entry_date,'municipio_id': payload.municipio_id});

      if (error) {
        throw new Error('Failed to save entry')
      }

      // Refresh entries list so the new entry appears
      try {
        await dispatch(fetchEntries()).unwrap()
      } catch (fetchError) {
        console.error('Failed to refresh entries after save', fetchError)
      }

      // Reset form and close
      setTitle('')
      setDescription('')
      setFiles([])
      onClose()
    } catch (error) {
      console.error('Error saving entry:', error)
      // TODO: Show error message to user
    } finally {
      setLoading(false)
    }
  }

  const placeText = useMemo(() => {
    if (!place) return ''
    const n = place.nombre ?? ''
    const p = place.provincia ?? ''
    return [n, p].filter(Boolean).join(' • ')
  }, [place])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[1200] flex items-end bg-black/30">
      <div className="max-h-[90vh] w-full rounded-t-3xl bg-white p-4 shadow-xl">
        <div className="mb-2 flex items-center justify-between">
          <button
            className="rounded-full p-2 text-zinc-600 hover:bg-zinc-100"
            aria-label="Close"
            onClick={onClose}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
          <div className="h-1.5 w-12 rounded-full bg-zinc-200" />
          <div />
        </div>

        <div className="space-y-4 overflow-y-auto pb-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">Title</label>
            <input
              type="text"
              placeholder="Start writing…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border-2 border-zinc-200 px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">Description</label>
            <textarea
              rows={5}
              placeholder="What happened?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full resize-none rounded-xl border-2 border-zinc-200 px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">Day</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border-2 border-zinc-200 px-3 py-2 outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">Place (click on map first)</label>
              <input
                type="text"
                value={placeText}
                readOnly
                className="w-full rounded-xl border-2 border-zinc-200 bg-zinc-50 px-3 py-2 text-zinc-700"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M4 7h16M4 17h16M4 12h10" stroke="currentColor" strokeWidth="2" />
              </svg>
              Photos
              <input
                type="file"
                multiple
                accept="image/*"
                {...(isMobile() ? { capture: 'environment' } : {})}
                onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                className="hidden"
              />
            </label>
            {files.length > 0 && <span className="text-xs text-zinc-600">{files.length} selected</span>}
          </div>

          <button
            className="mt-2 w-full rounded-full bg-blue-600 py-3 text-white shadow-md hover:bg-blue-700 disabled:opacity-60"
            onClick={handleSubmit}
            disabled={loading || !title.trim() || !place?.id}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

