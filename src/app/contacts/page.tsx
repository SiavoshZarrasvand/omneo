'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface Contact {
  id: string
  name: string
  phone: string
  email: string | null
  website: string | null
  address: string | null
  category: string | null
  rating: number | null
  reviews: number | null
  googleMapsUrl: string | null
  contacted: boolean
  contactedAt: string | null
  createdAt: string
}

export default function ContactsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<string>(
    searchParams.get('contacted') || 'all'
  )
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchContacts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...(filter !== 'all' && { contacted: filter }),
        ...(search && { search }),
      })

      const response = await fetch(`/api/contacts?${params}`)
      const data = await response.json()
      setContacts(data.contacts)
      setTotalPages(data.pagination.totalPages)
    } catch (error) {
      console.error('Failed to fetch contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContacts()
  }, [page, filter, search])

  const toggleContacted = async (id: string, currentStatus: boolean) => {
    try {
      await fetch('/api/contacts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, contacted: !currentStatus }),
      })
      fetchContacts()
    } catch (error) {
      console.error('Failed to update contact:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            Z-CRM
          </button>
          <button
            onClick={() => router.push('/')}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8">
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Search by name, phone, or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Contacts</option>
              <option value="true">Contacted</option>
              <option value="false">Not Contacted</option>
            </select>
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading...
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No contacts found. Upload some CSV or ZIP files to get started.
            </div>
          ) : (
            <div className="overflow-x-auto border border-border rounded-lg">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      Phone
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      Rating
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">
                      Contacted
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {contacts.map((contact) => (
                    <tr
                      key={contact.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">
                            {contact.name}
                          </span>
                          {contact.address && (
                            <span className="text-xs text-muted-foreground mt-1">
                              {contact.address}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {contact.phone}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {contact.category || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {contact.rating ? (
                          <span className="flex items-center gap-1">
                            <span className="text-yellow-500">★</span>
                            <span className="text-foreground">
                              {contact.rating}
                            </span>
                            {contact.reviews && (
                              <span className="text-muted-foreground text-xs">
                                ({contact.reviews})
                              </span>
                            )}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={contact.contacted}
                          onChange={() =>
                            toggleContacted(contact.id, contact.contacted)
                          }
                          className="w-5 h-5 cursor-pointer accent-primary"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-background border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-background border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
