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

export default function AdminMaster() {
  const [invites, setInvites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)
  const [addPositionTitle, setAddPositionTitle] = useState('')
  const [addNote, setAddNote] = useState('')

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

  const handleCreate = async () => {
    const title = addPositionTitle.trim()
    if (!title) {
      setError('Position title is required')
      return
    }
    setActionLoading('create')
    setError(null)
    try {
      await createInvite(title, addNote.trim() || undefined)
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
                <th>Invite link</th>
                <th>Position title</th>
                <th>Note</th>
                <th>Email</th>
                <th>Connections status</th>
                <th>Started at</th>
                <th>Created</th>
                <th className={styles.colCompleted}>Completed</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invites.length === 0 ? (
                <tr>
                  <td colSpan={9} className={styles.empty}>
                    No invites yet. Add a position title and click “Add invite link” to create one.
                  </td>
                </tr>
              ) : (
                invites.map((inv) => (
                  <tr key={inv.invite_link}>
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
                        aria-label="Connections status"
                      >
                        <option value="0">Not started (0)</option>
                        <option value="1">Started (1)</option>
                        <option value="2">Camera fixed (2)</option>
                        <option value="3">Completed (3)</option>
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
