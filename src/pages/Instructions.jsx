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
      if (inviteLink) {
        updateInvite(inviteLink, { connections_status: 1, assessment_started_at: new Date().toISOString() }).catch(() => {})
      }
    } catch (_) {}
    setStatus('loading')
  }

  useEffect(() => {
    if (status !== 'loading') return
    const t = setTimeout(() => {
      navigate(inviteLink ? `/invite/${inviteLink}/assessment` : '/assessment', { replace: true })
    }, LOADING_DURATION_MS)
    return () => clearTimeout(t)
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
                This assessment has <strong>{QUESTIONNAIRE_COUNT} questionnaires</strong> and a total of <strong>{QUESTION_COUNT} questions</strong>.
              </li>
              <li>
                This assessment takes about <strong>{ASSESSMENT_DURATION_MINUTES} minutes</strong> to complete.
              </li>
              <li>
                Please complete this assessment in <strong>one continuous browser session</strong>. You cannot pause, restart or re-take it once you start the assessment.
              </li>
              <li>
                <strong>Do not navigate away</strong> from the test browser or open new tabs. These actions may lead to <strong className={styles.warning}>disqualification</strong>.
              </li>
              <li>
                There is no negative marking for unattempted questions.
              </li>
              <li>
                You can use the <strong>Next</strong> and <strong>Previous</strong> buttons to navigate.
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
