import { useState, useEffect } from 'react'
import { getInvites, createInvite, updateInvite, deleteInvite } from '../api/invites'
import styles from './AdminMaster.module.css'

function formatDate(iso) {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return '—'
  }
}

const SORT_COLUMNS = {
  index: null,
  invite_link: 'invite_link',
  position_title: 'position_title',
  note: 'note',
  email: 'email',
  connections_status: 'connections_status',
  started_at: 'assessment_started_at',
  created_at: 'created_at',
  completed_at: 'completed_at',
}

function sortInvites(invites, sortBy, sortDir) {
  if (!sortBy || sortBy === 'index') {
    return [...invites]
  }
  const key = SORT_COLUMNS[sortBy]
  if (!key) return [...invites]
  return [...invites].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]
    const aNum = typeof aVal === 'number' ? aVal : null
    const bNum = typeof bVal === 'number' ? bVal : null
    const aDate = aVal && (aVal instanceof Date || typeof aVal === 'string') ? new Date(aVal).getTime() : NaN
    const bDate = bVal && (bVal instanceof Date || typeof bVal === 'string') ? new Date(bVal).getTime() : NaN
    let cmp = 0
    if (aNum != null && bNum != null) {
      cmp = aNum - bNum
    } else if (!Number.isNaN(aDate) && !Number.isNaN(bDate)) {
      cmp = aDate - bDate
    } else {
      const aStr = aVal != null ? String(aVal).toLowerCase() : ''
      const bStr = bVal != null ? String(bVal).toLowerCase() : ''
      cmp = aStr.localeCompare(bStr)
    }
    return sortDir === 'asc' ? cmp : -cmp
  })
}

export default function AdminMaster() {
  const [invites, setInvites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)
  const [addPositionTitle, setAddPositionTitle] = useState('')
  const [addNote, setAddNote] = useState('')
  const [addInviteType, setAddInviteType] = useState('partner') // 'partner' | 'investor'
  const [sortBy, setSortBy] = useState('created_at')
  const [sortDir, setSortDir] = useState('desc')

  const handleSort = (column) => {
    if (column === 'index') return
    setSortBy((prev) => {
      if (prev === column) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
      } else {
        setSortDir('asc')
      }
      return column
    })
  }

  const sortedInvites = sortInvites(invites, sortBy, sortDir)

  const loadInvites = async () => {
    try {
      setError(null)
      const list = await getInvites()
      setInvites(list)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInvites()
  }, [])

  // Real-time status updates: poll invites every 4 seconds
  useEffect(() => {
    const interval = setInterval(loadInvites, 4000)
    return () => clearInterval(interval)
  }, [])

  const handleCreate = async () => {
    const title = addPositionTitle.trim()
    if (!title) {
      setError('Position title is required')
      return
    }
    setActionLoading('create')
    setError(null)
    try {
      await createInvite(title, addNote.trim() || undefined, addInviteType)
      setAddPositionTitle('')
      setAddNote('')
      await loadInvites()
    } catch (e) {
      setError(e.message)
    } finally {
      setActionLoading(null)
    }
  }

  const updateInviteField = (inviteLink, field, value) => {
    setInvites((prev) =>
      prev.map((inv) =>
        inv.invite_link === inviteLink ? { ...inv, [field]: value } : inv
      )
    )
  }

  const handleSaveRow = async (inv) => {
    setActionLoading(`save-${inv.invite_link}`)
    setError(null)
    try {
      await updateInvite(inv.invite_link, {
        position_title: inv.position_title != null ? String(inv.position_title).trim() || null : null,
        note: inv.note != null ? String(inv.note).trim() || null : null,
        connections_status: Number(inv.connections_status),
      })
      await loadInvites()
    } catch (e) {
      setError(e.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (inviteLink) => {
    if (!window.confirm(`Delete invite "${inviteLink}"?`)) return
    setActionLoading(`delete-${inviteLink}`)
    setError(null)
    try {
      await deleteInvite(inviteLink)
      await loadInvites()
    } catch (e) {
      setError(e.message)
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.wrapper}>
          <p className={styles.muted}>Loading invites…</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.wrapper}>
        <header className={styles.header}>
          <h1 className={styles.title}>Admin – Invite links</h1>
          <p className={styles.subtitle}>CRUD for invite links</p>

          <div className={styles.addBlock}>
            <div className={styles.addTypeRow}>
              <span className={styles.addTypeLabel}>Type:</span>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="inviteType"
                  value="partner"
                  checked={addInviteType === 'partner'}
                  onChange={() => setAddInviteType('partner')}
                  className={styles.radio}
                />
                <span>Partner (22-char link)</span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="inviteType"
                  value="investor"
                  checked={addInviteType === 'investor'}
                  onChange={() => setAddInviteType('investor')}
                  className={styles.radio}
                />
                <span>Investor (25-char link)</span>
              </label>
            </div>
            <input
              type="text"
              className={styles.input}
              value={addPositionTitle}
              onChange={(e) => setAddPositionTitle(e.target.value)}
              placeholder="Position title (required)"
              aria-label="Position title"
            />
            <input
              type="text"
              className={styles.input}
              value={addNote}
              onChange={(e) => setAddNote(e.target.value)}
              placeholder="Note (optional)"
              aria-label="Note"
            />
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={handleCreate}
              disabled={actionLoading === 'create'}
            >
              {actionLoading === 'create' ? 'Adding…' : 'Add invite link'}
            </button>
          </div>
        </header>

        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.colIndex}>#</th>
                <th
                  className={styles.sortable}
                  onClick={() => handleSort('invite_link')}
                  onKeyDown={(e) => e.key === 'Enter' && handleSort('invite_link')}
                  tabIndex={0}
                  role="button"
                  aria-sort={sortBy === 'invite_link' ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  Invite link
                  {sortBy === 'invite_link' && (sortDir === 'asc' ? ' ↑' : ' ↓')}
                </th>
                <th
                  className={styles.sortable}
                  onClick={() => handleSort('position_title')}
                  onKeyDown={(e) => e.key === 'Enter' && handleSort('position_title')}
                  tabIndex={0}
                  role="button"
                  aria-sort={sortBy === 'position_title' ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  Position title
                  {sortBy === 'position_title' && (sortDir === 'asc' ? ' ↑' : ' ↓')}
                </th>
                <th
                  className={styles.sortable}
                  onClick={() => handleSort('note')}
                  onKeyDown={(e) => e.key === 'Enter' && handleSort('note')}
                  tabIndex={0}
                  role="button"
                  aria-sort={sortBy === 'note' ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  Note
                  {sortBy === 'note' && (sortDir === 'asc' ? ' ↑' : ' ↓')}
                </th>
                <th
                  className={styles.sortable}
                  onClick={() => handleSort('email')}
                  onKeyDown={(e) => e.key === 'Enter' && handleSort('email')}
                  tabIndex={0}
                  role="button"
                  aria-sort={sortBy === 'email' ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  Email
                  {sortBy === 'email' && (sortDir === 'asc' ? ' ↑' : ' ↓')}
                </th>
                <th
                  className={styles.sortable}
                  onClick={() => handleSort('connections_status')}
                  onKeyDown={(e) => e.key === 'Enter' && handleSort('connections_status')}
                  tabIndex={0}
                  role="button"
                  aria-sort={sortBy === 'connections_status' ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  Connections status
                  {sortBy === 'connections_status' && (sortDir === 'asc' ? ' ↑' : ' ↓')}
                </th>
                <th
                  className={styles.sortable}
                  onClick={() => handleSort('started_at')}
                  onKeyDown={(e) => e.key === 'Enter' && handleSort('started_at')}
                  tabIndex={0}
                  role="button"
                  aria-sort={sortBy === 'started_at' ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  Started at
                  {sortBy === 'started_at' && (sortDir === 'asc' ? ' ↑' : ' ↓')}
                </th>
                <th
                  className={styles.sortable}
                  onClick={() => handleSort('created_at')}
                  onKeyDown={(e) => e.key === 'Enter' && handleSort('created_at')}
                  tabIndex={0}
                  role="button"
                  aria-sort={sortBy === 'created_at' ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  Created
                  {sortBy === 'created_at' && (sortDir === 'asc' ? ' ↑' : ' ↓')}
                </th>
                <th
                  className={`${styles.colCompleted} ${styles.sortable}`}
                  onClick={() => handleSort('completed_at')}
                  onKeyDown={(e) => e.key === 'Enter' && handleSort('completed_at')}
                  tabIndex={0}
                  role="button"
                  aria-sort={sortBy === 'completed_at' ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  Completed
                  {sortBy === 'completed_at' && (sortDir === 'asc' ? ' ↑' : ' ↓')}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedInvites.length === 0 ? (
                <tr>
                  <td colSpan={10} className={styles.empty}>
                    No invites yet. Add a position title and click “Add invite link” to create one.
                  </td>
                </tr>
              ) : (
                sortedInvites.map((inv, index) => (
                  <tr key={inv.invite_link}>
                    <td className={styles.indexCell}>{index + 1}</td>
                    <td>
                      <code className={styles.code}>{inv.invite_link}</code>
                    </td>
                    <td>
                      <input
                        type="text"
                        className={styles.inputCell}
                        value={inv.position_title ?? ''}
                        onChange={(e) => updateInviteField(inv.invite_link, 'position_title', e.target.value)}
                        placeholder="Position title"
                        aria-label="Position title"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className={styles.inputCell}
                        value={inv.note ?? ''}
                        onChange={(e) => updateInviteField(inv.invite_link, 'note', e.target.value)}
                        placeholder="Note"
                        aria-label="Note"
                      />
                    </td>
                    <td>
                      <span className={styles.emailCell}>{inv.email || '—'}</span>
                    </td>
                    <td>
                      <select
                        value={String(inv.connections_status ?? 0)}
                        onChange={(e) => updateInviteField(inv.invite_link, 'connections_status', e.target.value)}
                        className={styles.select}
                        aria-label="Status"
                      >
                        <option value="0">Not started (0)</option>
                        <option value="1">Started (1)</option>
                        <option value="2">Camera fixed (2)</option>
                        <option value="3">Completed – user submission (3)</option>
                        <option value="4">Completed – rejected (4)</option>
                        <option value="5">Completed – timeout (5)</option>
                      </select>
                    </td>
                    <td>
                      <span className={styles.dateCell}>{formatDate(inv.assessment_started_at)}</span>
                    </td>
                    <td>
                      <span className={styles.dateCell}>{formatDate(inv.created_at)}</span>
                    </td>
                    <td className={styles.colCompleted}>
                      <span className={styles.dateCell}>{formatDate(inv.completed_at)}</span>
                    </td>
                    <td className={styles.actionsCell}>
                      <div className={styles.actionsCellInner}>
                        <button
                          type="button"
                          className={styles.btnSecondary}
                          onClick={() => handleSaveRow(inv)}
                          disabled={actionLoading === `save-${inv.invite_link}`}
                        >
                          {actionLoading === `save-${inv.invite_link}` ? 'Saving…' : 'Save'}
                        </button>
                        <button
                          type="button"
                          className={styles.btnDanger}
                          onClick={() => handleDelete(inv.invite_link)}
                          disabled={actionLoading === `delete-${inv.invite_link}`}
                        >
                          {actionLoading === `delete-${inv.invite_link}`
                            ? '…'
                            : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
