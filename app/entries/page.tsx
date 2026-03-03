'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useSession } from '@/lib/queries/useSession'
import { useEntriesQuery } from '@/lib/queries/useEntriesQuery'

export default function EntriesPage() {
  const router = useRouter()
  const { data: session, isLoading: sessionLoading } = useSession()
  const entriesQuery = useEntriesQuery(!!session)

  useEffect(() => {
    if (sessionLoading) return
    if (!session) router.replace('/login')
  }, [router, session, sessionLoading])

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return dateString
    }
  }

  if (sessionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#eaf2ff] to-[#eef7ef]">
        <div className="rounded-2xl bg-white p-6 shadow-md">Checking session…</div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eaf2ff] to-[#eef7ef]">
      <div className="sticky top-0 z-10 bg-white shadow-md">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="rounded-full p-2 text-zinc-600 hover:bg-zinc-100"
              aria-label="Back"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <Image src="/aquiahora-logo.svg" alt="AquiAhora" width={28} height={28} />
            <span className="text-base font-semibold text-zinc-900">All Entries</span>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        {entriesQuery.status === 'pending' && (
          <div className="flex items-center justify-center py-12">
            <div className="text-zinc-600">Loading entries…</div>
          </div>
        )}

        {entriesQuery.status === 'error' && (
          <div className="rounded-2xl bg-red-50 p-4 text-red-600">
            <p className="font-medium">Error</p>
            <p className="text-sm">Failed to load entries</p>
          </div>
        )}

        {entriesQuery.status === 'success' && (entriesQuery.data?.length ?? 0) === 0 && (
          <div className="rounded-2xl bg-white p-8 text-center shadow-md">
            <p className="text-zinc-600">No entries yet. Create your first entry!</p>
          </div>
        )}

        {entriesQuery.status === 'success' && (entriesQuery.data?.length ?? 0) > 0 && (
          <div className="space-y-4">
            {entriesQuery.data!.map((entry) => (
              <div
                key={entry.id}
                className="rounded-2xl bg-white p-4 shadow-md ring-1 ring-black/[0.04]"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-zinc-900">{entry.title || 'Untitled'}</h3>
                    <p className="mt-1 text-sm text-zinc-500">{formatDate(entry.entry_date)}</p>
                  </div>
                </div>

                {entry.description && (
                  <p className="mb-3 text-sm text-zinc-700 leading-relaxed">{entry.description}</p>
                )}

                <div className="flex items-center gap-2 rounded-xl bg-zinc-50 px-3 py-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  <span className="text-xs font-medium text-zinc-600">
                    Municipio ID: {entry.municipio_id}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

