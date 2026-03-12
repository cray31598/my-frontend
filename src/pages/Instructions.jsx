import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getInviteByLink, updateInvite } from '../api/invites'
import { QUESTIONNAIRE_COUNT, QUESTION_COUNT, ASSESSMENT_DURATION_MINUTES } from '../data/questions'
import styles from './Instructions.module.css'

const LOADING_DURATION_MS = 2500

const AGREEMENT_TEXT =
  'I agree not to copy code from any source, including colleagues, and will refrain from accessing websites or AI tools for assistance. Additionally, I commit to maintaining the confidentiality of this platform by not copying, sharing, or disclosing any content or questions through any medium or platform. *'

export default function Instructions() {
  const navigate = useNavigate()
  const { inviteLink } = useParams()
  const [status, setStatus] = useState('instructions') // 'instructions' | 'loading'
  const [inviteValid, setInviteValid] = useState(true)
  const [agreed, setAgreed] = useState(false)

  const assessmentStarted =
    typeof sessionStorage !== 'undefined' && sessionStorage.getItem('assessment_started') === 'true'

  useEffect(() => {
    try {
      if (assessmentStarted) {
        navigate(inviteLink ? `/invite/${inviteLink}/assessment` : '/assessment', { replace: true })
        return
      }
    } catch (_) {}
  }, [inviteLink, navigate])

  useEffect(() => {
    if (!inviteLink) return
    getInviteByLink(inviteLink)
      .then((inv) => {
        if (Number(inv.connections_status) === 3) {
          setInviteValid(false)
          navigate(`/invite/${inviteLink}`, { replace: true })
        }
      })
      .catch(() => setInviteValid(false))
  }, [inviteLink, navigate])

  useEffect(() => {
    try {
      if (!localStorage.getItem('assessment_candidate')) {
        navigate(inviteLink ? `/invite/${inviteLink}` : '/', { replace: true })
      }
    } catch (_) {
      navigate(inviteLink ? `/invite/${inviteLink}` : '/', { replace: true })
    }
  }, [inviteLink, navigate])

  const handleStart = () => {
    try {
      sessionStorage.setItem('assessment_started', 'true')
      if (inviteLink) {
        localStorage.setItem('assessment_started_invite', inviteLink)
      }
      const raw = localStorage.getItem('assessment_candidate')
      if (raw) {
        const candidate = JSON.parse(raw)
        localStorage.setItem('assessment_candidate', JSON.stringify({ ...candidate, agreed: true }))
      }
    } catch (_) {}
    setStatus('loading')
  }

  // When "Starting the assessment": persist connections_status=1 on the backend (with retry) so
  // another browser/device sees "Assessment already started". Then show loading and navigate.
  useEffect(() => {
    if (status !== 'loading') return
    let cancelled = false
    let navTimeoutId = null
    const doUpdate = () =>
      updateInvite(inviteLink, { connections_status: 1, assessment_started_at: new Date().toISOString() })
    const withTimeout = (p, ms) =>
      Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))])
    const scheduleNav = () => {
      navTimeoutId = setTimeout(() => {
        if (!cancelled) navigate(inviteLink ? `/invite/${inviteLink}/assessment` : '/assessment', { replace: true })
      }, LOADING_DURATION_MS)
    }
    if (!inviteLink) {
      scheduleNav()
      return () => {
        cancelled = true
        if (navTimeoutId) clearTimeout(navTimeoutId)
      }
    }
    ;(async () => {
      try {
        await withTimeout(doUpdate(), 6000)
      } catch (_) {
        try {
          await withTimeout(doUpdate(), 4000)
        } catch (_) {}
      }
      if (cancelled) return
      scheduleNav()
    })()
    return () => {
      cancelled = true
      if (navTimeoutId) clearTimeout(navTimeoutId)
    }
  }, [status, inviteLink, navigate])

  if (status === 'loading') {
    return (
      <div className={styles.loadingPage}>
        <h1 className={styles.loadingTitle}>Starting the assessment</h1>
        <div className={styles.spinner} aria-hidden="true" />
        <p className={styles.loadingText}>Please wait</p>
      </div>
    )
  }

  if (assessmentStarted || !inviteValid) return null

  return (
    <div className={styles.page}>
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <div className={styles.topBar}>
            <span className={styles.badge}>Assessment</span>
          </div>

          <h1 className={styles.instructionsTitle}>Instructions</h1>
          <p className={styles.subtitle}>Please read the following before you begin.</p>

          <div className={styles.listCard}>
            <ol className={styles.instructionsList}>
              <li>
                This assessment includes <strong>{QUESTIONNAIRE_COUNT} questionnaires</strong> with a total of <strong>{QUESTION_COUNT} questions</strong>.
              </li>
              <li>
                Please complete the assessment in <strong>one continuous browser session</strong>. Once started, it cannot be paused, restarted, or retaken.
              </li>
              <li>
                Please remain on the assessment tab and avoid opening new tabs or navigating away; doing so may result in <strong className={styles.warning}>disqualification</strong>.
              </li>
              <li>
                Unattempted questions are not penalized; there is no negative marking.
              </li>
              <li>
                Use the <strong>Next</strong> and <strong>Previous</strong> buttons to move between questions.
              </li>
              <li>
                As the final step, please complete a <strong>video interview summary</strong> of at least one minute.
              </li>
            </ol>
          </div>

          <div className={styles.agreement}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>{AGREEMENT_TEXT}</span>
            </label>
          </div>

          <div className={styles.startWrap}>
            <button
              type="button"
              className={styles.startBtn}
              onClick={handleStart}
              disabled={!agreed}
            >
              Start assessment
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
