import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getInviteByLink, getAssessmentTimer } from '../api/invites'
import { QUESTIONNAIRES, ASSESSMENT_DURATION_MINUTES } from '../data/questions'
import styles from './Assessment.module.css'

const TOTAL_QUESTIONS = QUESTIONNAIRES.reduce((sum, q) => sum + q.questions.length, 0)
const INITIAL_SECONDS = ASSESSMENT_DURATION_MINUTES * 60

function formatTimeLeft(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}m : ${String(s).padStart(2, '0')}s`
}

function StopwatchIcon({ className }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function PaginationFirstIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 17V7l-6 5 6 5z" />
      <path d="M6 17V7" />
    </svg>
  )
}
function PaginationPrevIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}
function PaginationNextIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}
function PaginationLastIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 17V7l6 5-6 5z" />
      <path d="M18 17V7" />
    </svg>
  )
}

function getSelectionKey(qIndex, questionId) {
  return `${qIndex}-${questionId}`
}

export default function Assessment() {
  const navigate = useNavigate()
  const { inviteLink } = useParams()
  const [currentQIndex, setCurrentQIndex] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selections, setSelections] = useState({})
  const [registered, setRegistered] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(INITIAL_SECONDS)
  const timerRef = useRef(null)
  const pollRef = useRef(null)
  const hasNavigatedOnZeroRef = useRef(false)
  const leaveCountKey = inviteLink ? `assessment_leave_count_${inviteLink}` : 'assessment_leave_count'
  const [leaveCount, setLeaveCount] = useState(() => {
    try {
      const s = sessionStorage.getItem(leaveCountKey)
      const n = parseInt(s, 10)
      return Number.isNaN(n) ? 0 : n
    } catch (_) {
      return 0
    }
  })
  const [showLeaveAlert, setShowLeaveAlert] = useState(false)

  useEffect(() => {
    if (inviteLink) {
      try {
        sessionStorage.setItem('invite_link', inviteLink)
      } catch (_) {}
    }
  }, [inviteLink])

  // Restore leave count from sessionStorage after mount (inviteLink may be set after first render).
  useEffect(() => {
    try {
      const s = sessionStorage.getItem(leaveCountKey)
      const n = parseInt(s, 10)
      if (!Number.isNaN(n)) setLeaveCount(n)
    } catch (_) {}
  }, [leaveCountKey])

  useEffect(() => {
    if (!inviteLink) return
    let cancelled = false
    getInviteByLink(inviteLink)
      .then((inv) => {
        if (cancelled) return
        const status = Number(inv.connections_status)
        // Redirect to first page if not started (0) or already completed (3)
        if (status === 0 || status === 3) {
          navigate(`/invite/${inviteLink}`, { replace: true })
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [inviteLink, navigate])

  useEffect(() => {
    try {
      const stored = localStorage.getItem('assessment_candidate')
      setRegistered(!!stored)
      if (!stored) navigate(inviteLink ? `/invite/${inviteLink}` : '/', { replace: true })
    } catch (_) {
      navigate(inviteLink ? `/invite/${inviteLink}` : '/', { replace: true })
    }
  }, [navigate, inviteLink])

  // Backend-driven timer when we have an invite link: poll every second and show server's remaining time.
  useEffect(() => {
    if (!registered || !inviteLink) return
    let cancelled = false
    const poll = () => {
      getAssessmentTimer(inviteLink)
        .then(({ seconds_remaining }) => {
          if (cancelled) return
          setSecondsLeft(seconds_remaining)
          if (seconds_remaining <= 0) {
            navigate(`/invite/${inviteLink}/summary-interview`, { replace: true })
            return
          }
          pollRef.current = setTimeout(poll, 1000)
        })
        .catch(() => {
          if (cancelled) return
          pollRef.current = setTimeout(poll, 2000)
        })
    }
    poll()
    return () => {
      cancelled = true
      if (pollRef.current) clearTimeout(pollRef.current)
    }
  }, [registered, inviteLink, navigate])

  // Fallback: local countdown when no invite link (e.g. direct /assessment).
  useEffect(() => {
    if (!registered || inviteLink) return
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [registered, inviteLink])

  // When fallback countdown hits 0, go to summary-interview (once).
  useEffect(() => {
    if (secondsLeft <= 0 && registered && !inviteLink && !hasNavigatedOnZeroRef.current) {
      hasNavigatedOnZeroRef.current = true
      navigate('/summary-interview', { replace: true })
    }
  }, [secondsLeft, registered, inviteLink, navigate])

  // Leave-page warning: on window blur we increment leave count (persisted) and show modal only.
  useEffect(() => {
    if (!registered) return
    const onBlur = () => {
      setLeaveCount((c) => {
        const next = c + 1
        try {
          sessionStorage.setItem(leaveCountKey, String(next))
        } catch (_) {}
        return next
      })
      setShowLeaveAlert(true)
    }
    window.addEventListener('blur', onBlur)
    return () => window.removeEventListener('blur', onBlur)
  }, [registered, leaveCountKey])

  const handleLeaveAlertAgree = () => {
    setShowLeaveAlert(false)
  }

  const questionnaire = QUESTIONNAIRES[currentQIndex]
  const questions = questionnaire?.questions ?? []
  const question = questions[currentQuestionIndex]
  const questionNumber =
    QUESTIONNAIRES.slice(0, currentQIndex).reduce((sum, q) => sum + q.questions.length, 0) +
    currentQuestionIndex +
    1
  const selectedAnswerId = question ? selections[getSelectionKey(currentQIndex, question.id)] : null
  const allAnswered = Object.keys(selections).length === TOTAL_QUESTIONS
  const isFirstQuestion = currentQIndex === 0 && currentQuestionIndex === 0
  const isLastQuestion =
    currentQIndex === QUESTIONNAIRES.length - 1 &&
    currentQuestionIndex === questions.length - 1
  const canFinish = isLastQuestion && allAnswered

  const handleSelect = (answerId) => {
    if (!question) return
    setSelections((prev) => ({
      ...prev,
      [getSelectionKey(currentQIndex, question.id)]: answerId,
    }))
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((i) => i - 1)
    } else if (currentQIndex > 0) {
      setCurrentQIndex((i) => i - 1)
      setCurrentQuestionIndex(QUESTIONNAIRES[currentQIndex - 1].questions.length - 1)
    }
  }

  const handleNext = () => {
    if (canFinish) {
      try {
        localStorage.setItem('assessment_completed', 'true')
        const inviteLink = sessionStorage.getItem('invite_link')
        if (inviteLink) {
          navigate(`/invite/${inviteLink}/summary-interview`, { replace: true })
          return
        }
      } catch (_) {}
      navigate('/summary-interview', { replace: true })
      return
    }
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1)
    } else if (currentQIndex < QUESTIONNAIRES.length - 1) {
      setCurrentQIndex((i) => i + 1)
      setCurrentQuestionIndex(0)
    }
  }

  const goToQuestion = (oneBasedNumber) => {
    if (oneBasedNumber < 1 || oneBasedNumber > TOTAL_QUESTIONS) return
    let remaining = oneBasedNumber - 1
    for (let qi = 0; qi < QUESTIONNAIRES.length; qi++) {
      const len = QUESTIONNAIRES[qi].questions.length
      if (remaining < len) {
        setCurrentQIndex(qi)
        setCurrentQuestionIndex(remaining)
        return
      }
      remaining -= len
    }
  }

  if (!registered || !question) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Loading…</div>
      </div>
    )
  }

  const progressPercent = (questionNumber / TOTAL_QUESTIONS) * 100

  const isQuestionAnswered = (oneBasedNum) => {
    let remaining = oneBasedNum - 1
    for (let qi = 0; qi < QUESTIONNAIRES.length; qi++) {
      const qs = QUESTIONNAIRES[qi].questions
      if (remaining < qs.length) {
        const questionId = qs[remaining].id
        return !!selections[getSelectionKey(qi, questionId)]
      }
      remaining -= qs.length
    }
    return false
  }

  return (
    <div className={styles.page}>
      {showLeaveAlert && (
        <div className={styles.leaveAlertOverlay} role="alertdialog" aria-modal="true" aria-labelledby="leave-alert-title">
          <div className={styles.leaveAlertCard}>
            <h2 id="leave-alert-title" className={styles.leaveAlertTitle}>WARNING: DO NOT NAVIGATE AWAY</h2>
            <p className={styles.leaveAlertLine}>AFTER {leaveCount} Time(s) OF LEAVING THE PAGE</p>
            <p className={styles.leaveAlertLine}>
              YOU WILL BE <span className={styles.leaveAlertHighlight}>DISQUALIFIED</span>
            </p>
            <button
              type="button"
              className={styles.leaveAlertBtn}
              onClick={handleLeaveAlertAgree}
            >
              I AGREE
            </button>
          </div>
        </div>
      )}
      <div className={styles.card}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionHeaderLeft}>
            <span className={styles.sectionBadge}>
              Questionnaire {currentQIndex + 1} of {QUESTIONNAIRES.length}
            </span>
            <h2 className={styles.questionnaireTitle}>{questionnaire.title}</h2>
            {questionnaire.description && (
              <p className={styles.questionnaireDescription}>{questionnaire.description}</p>
            )}
          </div>
          <div className={styles.timerWrap} role="timer" aria-live="polite" aria-label={`Time left: ${formatTimeLeft(secondsLeft)}`}>
            <StopwatchIcon className={styles.timerIcon} />
            <span className={styles.timerValue}>{formatTimeLeft(secondsLeft)}</span>
            <span className={styles.timerLabel}> left</span>
          </div>
        </div>

        <div className={styles.progress}>
          <span className={styles.progressText}>
            Question {currentQuestionIndex + 1} of {questions.length}
            <span className={styles.progressTotal}>
              {' '}
              · {questionNumber} of {TOTAL_QUESTIONS} total
            </span>
          </span>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progressPercent}%` }}
              role="progressbar"
              aria-valuenow={questionNumber}
              aria-valuemin={1}
              aria-valuemax={TOTAL_QUESTIONS}
            />
          </div>
        </div>

        <nav className={styles.pagination} aria-label="Question navigation">
          <div className={styles.paginationNavGroup}>
            <button
              type="button"
              className={styles.paginationMenu}
              onClick={() => {}}
              aria-label="Menu"
              title="Menu"
            >
              <span className={styles.hamburger} aria-hidden>☰</span>
            </button>
            <button
              type="button"
              className={styles.paginationBtn}
              onClick={() => goToQuestion(1)}
              disabled={isFirstQuestion}
              aria-label="First question"
            >
              <PaginationFirstIcon />
            </button>
            <button
              type="button"
              className={styles.paginationBtn}
              onClick={handlePrevious}
              disabled={isFirstQuestion}
              aria-label="Previous question"
            >
              <PaginationPrevIcon />
            </button>
          </div>
          <div className={styles.paginationNumbersWrap}>
            <div className={styles.paginationNumbers}>
              {Array.from({ length: TOTAL_QUESTIONS }, (_, i) => i + 1).map((num) => {
                const isActive = questionNumber === num
                const isAnswered = isQuestionAnswered(num)
                const className = [
                  isActive ? styles.paginationNumActive : styles.paginationNum,
                  isAnswered ? styles.paginationNumAnswered : null,
                ].filter(Boolean).join(' ')
                return (
                  <button
                    key={num}
                    type="button"
                    className={className}
                    onClick={() => goToQuestion(num)}
                    aria-label={`Question ${num}${isAnswered ? ' (answered)' : ''}`}
                    aria-current={isActive ? 'true' : undefined}
                  >
                    {num}
                  </button>
                )
              })}
            </div>
          </div>
          <div className={styles.paginationNavGroup}>
            <button
              type="button"
              className={styles.paginationBtn}
              onClick={handleNext}
              disabled={isLastQuestion}
              aria-label="Next question"
            >
              <PaginationNextIcon />
            </button>
            <button
              type="button"
              className={styles.paginationBtn}
              onClick={() => goToQuestion(TOTAL_QUESTIONS)}
              disabled={isLastQuestion}
              aria-label="Last question"
            >
              <PaginationLastIcon />
            </button>
            <button
              type="button"
              className={styles.paginationInfo}
              aria-label="Information"
              title="Assessment information"
            >
              <span aria-hidden>i</span>
            </button>
          </div>
        </nav>

        <h3 className={styles.questionText}>{question.text}</h3>

        <fieldset className={styles.answers} aria-label="Choose one answer">
          {question.answers.map((answer) => (
            <label
              key={answer.id}
              className={
                selectedAnswerId === answer.id
                  ? `${styles.option} ${styles.optionSelected}`
                  : styles.option
              }
            >
              <input
                type="radio"
                name={`q-${currentQIndex}-${question.id}`}
                value={answer.id}
                checked={selectedAnswerId === answer.id}
                onChange={() => handleSelect(answer.id)}
                className={styles.radio}
              />
              <span className={styles.optionText}>{answer.text}</span>
            </label>
          ))}
        </fieldset>

        <div className={styles.nav}>
          <button
            type="button"
            onClick={handlePrevious}
            disabled={isFirstQuestion}
            className={styles.btnPrev}
            aria-label="Previous question"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={isLastQuestion && !allAnswered}
            className={styles.btnNext}
            aria-label={isLastQuestion ? 'Finish assessment' : 'Next question'}
            title={isLastQuestion && !allAnswered ? 'Answer all questions to continue' : undefined}
          >
            {isLastQuestion ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}
