// Backend API base. Set VITE_API_URL in .env to override. Use http for local dev (backend has no SSL).
const API_BASE = import.meta.env.VITE_API_URL || 'https://myproject-backend-beta.vercel.app'
// const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    const msg = err?.error || res.statusText
    if (res.status === 404) {
      throw new Error(`${msg}. Is the backend running? Start it: cd backend && npm run dev`)
    }
    throw new Error(msg)
  }
  if (res.status === 204) return null
  return res.json()
}

export async function getInvites() {
  const data = await request('/api/invites')
  return data.invites
}

/** Get a single invite by link. Returns { invite_link, connections_status, email } or throws. */
export async function getInviteByLink(inviteLink) {
  const data = await request(`/api/invites/${encodeURIComponent(inviteLink)}`)
  return data.invite
}

/** Get real-time assessment timer from backend (seconds_remaining, server_time). */
export async function getAssessmentTimer(inviteLink) {
  const data = await request(`/api/invites/${encodeURIComponent(inviteLink)}/timer`)
  return { seconds_remaining: data.seconds_remaining, server_time: data.server_time }
}

const INVITE_CODE_LENGTH = 22
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789'

/** Generate a random invite link (same format as backend). */
function randomInviteLink() {
  let s = ''
  for (let i = 0; i < INVITE_CODE_LENGTH; i++) {
    s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  }
  return s
}

/** Generate a unique invite link that is not in the given list (e.g. not in DB). */
export function generateInviteLinkNotInList(existingLinks) {
  const set = new Set(existingLinks || [])
  let link
  do {
    link = randomInviteLink()
  } while (set.has(link))
  return link
}

/** Add an invite. Backend generates invite_link if omitted. Pass position_title (required for UI), optional note, invite_type 'partner' (22-char link) or 'investor' (25-char link). */
export async function createInvite(positionTitle, note, inviteType = 'partner') {
  const body = { invite_type: inviteType === 'investor' ? 'investor' : 'partner' }
  if (positionTitle != null && String(positionTitle).trim() !== '') body.position_title = String(positionTitle).trim()
  if (note != null && String(note).trim() !== '') body.note = String(note).trim()
  const opts = { method: 'POST', body: JSON.stringify(body) }
  const data = await request('/api/invites', opts)
  return data.invite
}

/** Update an invite. Pass { connections_status, email, position_title } (one or more). */
export async function updateInvite(inviteLink, updates) {
  const data = await request(`/api/invites/${encodeURIComponent(inviteLink)}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  })
  return data.invite
}

export async function deleteInvite(inviteLink) {
  await request(`/api/invites/${encodeURIComponent(inviteLink)}`, {
    method: 'DELETE',
  })
}
