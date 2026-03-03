import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getInviteByLink, updateInvite } from '../api/invites'
import styles from './SummaryInterview.module.css'

export default function SummaryInterview() {
  const navigate = useNavigate()
  const { inviteLink } = useParams()
  const videoRef = useRef(null)
  const playbackRef = useRef(null)
  const [status, setStatus] = useState('idle') // idle | loading | ready | recording | recorded | error
  const [error, setError] = useState(null)
  const [stream, setStream] = useState(null)
  const [recordingBlob, setRecordingBlob] = useState(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const [playbackPlaying, setPlaybackPlaying] = useState(false)
  const [playbackCurrent, setPlaybackCurrent] = useState(0)
  const [playbackDuration, setPlaybackDuration] = useState(0)
  const [playbackVolume, setPlaybackVolume] = useState(1)
  const playbackProgressRef = useRef(null)
  const [recordingElapsed, setRecordingElapsed] = useState(0)
  const recordingStartRef = useRef(null)

  const [allowed, setAllowed] = useState(null) // null = checking, true = show page, false = redirecting
  const [assessmentCompleted, setAssessmentCompleted] = useState(false) // true only when user has completed the assessment
  const [connectionsStatus, setConnectionsStatus] = useState(null) // 0/1 = camera not fixed, 2 = camera fixed (button active), 3 = completed
  const [invalidInvite, setInvalidInvite] = useState(false) // true when invite URL exists but invite was deleted
  const [submitStatus, setSubmitStatus] = useState(null) // null | 'submitting' | 'success'
  const [submitProgress, setSubmitProgress] = useState(0) // 0–100 for 5s circle

  useEffect(() => {
    if (!inviteLink) return
    setInvalidInvite(false)
    getInviteByLink(inviteLink)
      .then((inv) => {
        const status = Number(inv.connections_status)
        setConnectionsStatus(status)
        setInvalidInvite(status === 3)
      })
      .catch(() => {
        setInvalidInvite(true)
      })
  }, [inviteLink])

  useEffect(() => {
    if (inviteLink) return // when invite in URL, we fetch above
    try {
      const s = sessionStorage.getItem('invite_connections_status')
      if (s !== null) setConnectionsStatus(Number(s))
    } catch (_) {}
  }, [inviteLink])

  useEffect(() => {
    try {
      const candidate = localStorage.getItem('assessment_candidate')
      const completed = localStorage.getItem('assessment_completed')
      if (!candidate) {
        navigate(inviteLink ? `/invite/${inviteLink}` : '/', { replace: true })
        setAllowed(false)
        return
      }
      setAllowed(true)
      setAssessmentCompleted(!!completed)
    } catch (_) {
      navigate(inviteLink ? `/invite/${inviteLink}` : '/', { replace: true })
      setAllowed(false)
    }
  }, [navigate, inviteLink])

  const stopStream = useCallback((s) => {
    if (s && s.getTracks) s.getTracks().forEach((t) => t.stop())
  }, [])

  useEffect(() => {
    return () => {
      stopStream(stream)
    }
  }, [stream, stopStream])

  const playbackUrl = useMemo(
    () => (recordingBlob ? URL.createObjectURL(recordingBlob) : ''),
    [recordingBlob]
  )
  useEffect(() => {
    return () => {
      if (playbackUrl) URL.revokeObjectURL(playbackUrl)
    }
  }, [playbackUrl])

  const startCamera = async () => {
    setError(null)
    setStatus('loading')
    try {
      const constraints = {
        video: { width: 1280, height: 720, facingMode: 'user' },
        audio: true,
      }
      let mediaStream
      if (navigator.mediaDevices?.getUserMedia) {
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      } else {
        const legacyGetUserMedia =
          navigator.getUserMedia ||
          navigator.webkitGetUserMedia ||
          navigator.mozGetUserMedia
        if (!legacyGetUserMedia) {
          setError(
            'Camera is not available. Use HTTPS or open this page at http://localhost to allow camera access.'
          )
          setStatus('error')
          return
        }
        mediaStream = await new Promise((resolve, reject) => {
          legacyGetUserMedia.call(navigator, constraints, resolve, reject)
        })
      }
      setStream(mediaStream)
      setStatus('ready')
    } catch (err) {
      setError(err.message || 'Could not access camera or microphone.')
      setStatus('error')
    }
  }

  // Attach stream to video element when both exist (video mounts only when status is ready/recording)
  useEffect(() => {
    if (!stream || !videoRef.current) return
    videoRef.current.srcObject = stream
    const video = videoRef.current
    const play = () => video.play().catch(() => {})
    play()
    return () => {
      video.srcObject = null
    }
  }, [stream, status])

  const startRecording = () => {
    if (!stream || status !== 'ready') return
    chunksRef.current = []
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm',
      videoBitsPerSecond: 2500000,
      audioBitsPerSecond: 128000,
    })
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' })
      setRecordingBlob(blob)
      setStatus('recorded')
    }
    mediaRecorder.start(1000)
    mediaRecorderRef.current = mediaRecorder
    recordingStartRef.current = Date.now()
    setRecordingElapsed(0)
    setStatus('recording')
  }

  // Timer while recording
  useEffect(() => {
    if (status !== 'recording') return
    const interval = setInterval(() => {
      if (recordingStartRef.current) {
        setRecordingElapsed(Math.floor((Date.now() - recordingStartRef.current) / 1000))
      }
    }, 1000)
    return () => {
      clearInterval(interval)
      recordingStartRef.current = null
    }
  }, [status])

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
  }

  const reRecord = () => {
    setRecordingBlob(null)
    setSubmitStatus(null)
    setSubmitProgress(0)
    if (playbackRef.current) playbackRef.current.src = ''
    setPlaybackPlaying(false)
    setPlaybackCurrent(0)
    setPlaybackDuration(0)
    setStatus('ready')
  }

  const SUBMIT_DURATION_MS = 5000

  const handleSubmit = async () => {
    if (!inviteLink) return
    setSubmitStatus('submitting')
    setSubmitProgress(0)
    const start = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - start
      const p = Math.min(100, (elapsed / SUBMIT_DURATION_MS) * 100)
      setSubmitProgress(p)
      if (p >= 100) {
        clearInterval(interval)
      }
    }, 50)
    await new Promise((r) => setTimeout(r, SUBMIT_DURATION_MS))
    clearInterval(interval)
    try {
      await updateInvite(inviteLink, { connections_status: 3 })
      setConnectionsStatus(3)
      try {
        sessionStorage.setItem('invite_connections_status', '3')
      } catch (_) {}
    } catch (_) {}
    setSubmitStatus('success')
  }

  useEffect(() => {
    if (submitStatus !== 'success' || !inviteLink) return
    const t = setTimeout(() => {
      navigate(`/invite/${inviteLink}/completed`, { replace: true })
    }, 2500)
    return () => clearTimeout(t)
  }, [submitStatus, inviteLink, navigate])

  const downloadRecording = () => {
    if (!recordingBlob) return
    const url = URL.createObjectURL(recordingBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `summary-interview-${Date.now()}.webm`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Playback video: sync state and custom controls (controls stay in original position, not mirrored)
  useEffect(() => {
    const video = playbackRef.current
    if (!video || !playbackUrl) return
    const onTimeUpdate = () => setPlaybackCurrent(video.currentTime)
    const onDurationChange = () => setPlaybackDuration(video.duration || 0)
    const onPlay = () => setPlaybackPlaying(true)
    const onPause = () => setPlaybackPlaying(false)
    const onEnded = () => setPlaybackPlaying(false)
    video.addEventListener('timeupdate', onTimeUpdate)
    video.addEventListener('durationchange', onDurationChange)
    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    video.addEventListener('ended', onEnded)
    setPlaybackDuration(video.duration || 0)
    setPlaybackCurrent(video.currentTime)
    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate)
      video.removeEventListener('durationchange', onDurationChange)
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('ended', onEnded)
    }
  }, [playbackUrl])

  const togglePlayback = () => {
    const video = playbackRef.current
    if (!video) return
    if (video.paused) video.play()
    else video.pause()
  }

  const seekPlayback = (e) => {
    const video = playbackRef.current
    const bar = playbackProgressRef.current
    if (!video || !bar) return
    const rect = bar.getBoundingClientRect()
    const p = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    video.currentTime = p * video.duration
  }

  const changePlaybackVolume = (v) => {
    const video = playbackRef.current
    if (video) video.volume = v
    setPlaybackVolume(v)
  }

  const togglePlaybackFullscreen = () => {
    const wrap = playbackRef.current?.closest(`.${styles.previewWrap}`)
    if (!wrap) return
    if (!document.fullscreenElement) {
      wrap.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
  }

  const formatTime = (s) => {
    if (!Number.isFinite(s) || s < 0) return '0:00'
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  if (allowed === null || allowed === false) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Loading…</div>
      </div>
    )
  }

  if (inviteLink && invalidInvite) {
    return (
      <div className={styles.page}>
        <div className={styles.invalidInvite}>
          <p className={styles.invalidInviteText}>Invalid or expired invite link.</p>
        </div>
      </div>
    )
  }

  if (allowed && !assessmentCompleted) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <header className={styles.header}>
            <span className={styles.badge}>Summary Interview</span>
            <h1 className={styles.title}>Record your summary</h1>
          </header>
          <div className={styles.completeAssessmentWrap}>
            <div className={styles.warningAlert} role="alert">
              <span className={styles.warningAlertIcon} aria-hidden>⚠</span>
              <div className={styles.warningAlertContent}>
                <p className={styles.warningAlertTitle}>Complete assessment first</p>
                <p className={styles.warningAlertMessage}>
                  You need to complete all questions before you can record your summary.
                </p>
              </div>
            </div>
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={() => navigate(inviteLink ? `/invite/${inviteLink}/assessment` : '/assessment', { replace: true })}
            >
              Go to assessment
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {submitStatus === 'success' && (
        <div className={styles.toastWrap} role="alert" aria-live="polite">
          <div className={styles.toast}>
            <span className={styles.toastIcon}>✓</span>
            <p className={styles.toastMessage}>Your assessment was successfully submitted.</p>
          </div>
        </div>
      )}
      <div className={styles.card}>
        <header className={styles.header}>
          <span className={styles.badge}>Summary Interview</span>
          <h1 className={styles.title}>
            {status === 'recorded' ? 'Review your summary' : 'Record your summary'}
          </h1>
          <p className={styles.subtitle}>
            {status === 'recorded'
              ? 'Play back your recording below. Re-record or download when you’re satisfied.'
              : 'Record a short video (at least 1 minute) summarizing your experience and key points from the assessment. Start the camera, then begin recording when ready.'}
          </p>
        </header>

        {error && (
          <div className={styles.errorBanner} role="alert">
            <span className={styles.errorBannerIcon} aria-hidden>⚠</span>
            <span>{error}</span>
          </div>
        )}

        <div className={styles.videoSection}>
          {status === 'idle' && (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>▶</span>
              {connectionsStatus !== 2 ? (
                <>
                  <div className={styles.warningAlert} role="alert">
                    <span className={styles.warningAlertIcon} aria-hidden>⚠</span>
                    <div className={styles.warningAlertContent}>
                      <p className={styles.warningAlertTitle}>
                        {!assessmentCompleted ? 'Complete assessment first' : 'Camera unavailable'}
                      </p>
                      <p className={styles.warningAlertMessage}>
                        {!assessmentCompleted
                          ? 'You need to complete all questions before you can record your summary.'
                          : 'Your camera driver may be outdated. Please update it to the latest version to use the recording feature.'}
                      </p>
                    </div>
                  </div>
                  <button type="button" className={styles.btnPrimary} disabled>
                    Start camera
                  </button>
                </>
              ) : (
                <>
                  <p>Camera is off. Click &quot;Start camera&quot; to begin.</p>
                  <button
                    type="button"
                    onClick={startCamera}
                    className={styles.btnPrimary}
                    disabled={connectionsStatus !== 2}
                  >
                    Start camera
                  </button>
                </>
              )}
            </div>
          )}

          {status === 'loading' && (
            <div className={styles.placeholder}>
              <span className={styles.placeholderSpinner} aria-hidden />
              <p>Requesting camera and microphone…</p>
            </div>
          )}

          {(status === 'ready' || status === 'recording') && (
            <div className={styles.previewWrap}>
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className={styles.video}
              />
              {status === 'recording' && (
                <div className={styles.recordingIndicator}>
                  <span className={styles.recDot} /> Recording… <span className={styles.recordingTime}>{formatTime(recordingElapsed)}</span>
                </div>
              )}
            </div>
          )}

          {status === 'recorded' && playbackUrl && (
            <div className={styles.previewWrap}>
              {submitStatus === 'submitting' && (
                <div className={styles.submitOverlay}>
                  <div className={styles.circleProgressWrap}>
                    <svg className={styles.circleProgressSvg} viewBox="0 0 100 100">
                      <circle className={styles.circleProgressBg} cx="50" cy="50" r="45" />
                      <circle
                        className={styles.circleProgressFill}
                        cx="50"
                        cy="50"
                        r="45"
                        style={{ strokeDasharray: `${(submitProgress / 100) * 283} 283` }}
                      />
                    </svg>
                    <span className={styles.circleProgressLabel}>
                      {Math.round((submitProgress / 100) * 5)}s
                    </span>
                  </div>
                  <p className={styles.submitOverlayText}>Submitting…</p>
                </div>
              )}
              <video
                ref={playbackRef}
                src={playbackUrl}
                playsInline
                className={styles.video}
                onClick={togglePlayback}
              />
              <div className={styles.playbackControls} aria-label="Video controls">
                <button type="button" onClick={togglePlayback} className={styles.controlBtn} aria-label={playbackPlaying ? 'Pause' : 'Play'}>
                  {playbackPlaying ? '⏸' : '▶'}
                </button>
                <span className={styles.controlTime}>{formatTime(playbackCurrent)}</span>
                <div
                  ref={playbackProgressRef}
                  className={styles.progressBar}
                  onClick={seekPlayback}
                  role="slider"
                  aria-valuenow={playbackDuration ? (playbackCurrent / playbackDuration) * 100 : 0}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    const video = playbackRef.current
                    if (!video) return
                    if (e.key === 'ArrowLeft') video.currentTime = Math.max(0, video.currentTime - 5)
                    if (e.key === 'ArrowRight') video.currentTime = Math.min(video.duration, video.currentTime + 5)
                  }}
                >
                  <div className={styles.progressFill} style={{ width: `${playbackDuration ? (playbackCurrent / playbackDuration) * 100 : 0}%` }} />
                </div>
                <span className={styles.controlTime}>{formatTime(playbackDuration)}</span>
                <button type="button" onClick={() => changePlaybackVolume(playbackVolume === 0 ? 1 : 0)} className={styles.controlBtn} aria-label={playbackVolume === 0 ? 'Unmute' : 'Mute'}>
                  {playbackVolume === 0 ? '🔇' : '🔊'}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={playbackVolume}
                  onChange={(e) => changePlaybackVolume(parseFloat(e.target.value))}
                  className={styles.volumeSlider}
                  aria-label="Volume"
                />
                <button type="button" onClick={togglePlaybackFullscreen} className={styles.controlBtn} aria-label="Fullscreen">
                  ⛶
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={styles.actions}>
          {status === 'ready' && (
            <>
              <button type="button" onClick={startRecording} className={styles.btnPrimary}>
                Start recording
              </button>
            </>
          )}
          {status === 'recording' && (
            <button type="button" onClick={stopRecording} className={styles.btnDanger}>
              Stop recording
            </button>
          )}
          {status === 'recorded' && (
            <>
              <button type="button" onClick={reRecord} className={styles.btnSecondary}>
                Re-record
              </button>
              {inviteLink ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className={styles.btnPrimary}
                  disabled={submitStatus === 'submitting'}
                >
                  Submit
                </button>
              ) : (
                <button type="button" onClick={downloadRecording} className={styles.btnPrimary}>
                  Download recording
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
