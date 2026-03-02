import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getInviteByLink } from '../api/invites'
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
  const [connectionsStatus, setConnectionsStatus] = useState(null) // null = loading, 0 = disabled, 2 = enabled
  const [invalidInvite, setInvalidInvite] = useState(false) // true when invite URL exists but invite was deleted

  useEffect(() => {
    if (!inviteLink) return
    setInvalidInvite(false)
    getInviteByLink(inviteLink)
      .then((inv) => {
        setConnectionsStatus(Number(inv.connections_status))
        setInvalidInvite(false)
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
        navigate('/signup', { replace: true })
        setAllowed(false)
        return
      }
      if (!completed) {
        navigate('/assessment', { replace: true })
        setAllowed(false)
        return
      }
      setAllowed(true)
    } catch (_) {
      navigate('/signup', { replace: true })
      setAllowed(false)
    }
  }, [navigate])

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
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
        audio: true,
      })
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
    if (playbackRef.current) playbackRef.current.src = ''
    setPlaybackPlaying(false)
    setPlaybackCurrent(0)
    setPlaybackDuration(0)
    setStatus('ready')
  }

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
          <button type="button" className={styles.btnPrimary} onClick={() => navigate('/signup', { replace: true })}>
            Go to home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <header className={styles.header}>
          <span className={styles.badge}>Summary Interview</span>
          <h1 className={styles.title}>
            {status === 'recorded' ? 'Review your summary' : 'Record your summary'}
          </h1>
          <p className={styles.subtitle}>
            {status === 'recorded'
              ? 'Play back your recording below. Re-record or download when you’re satisfied.'
              : 'Record a short video summarizing your experience and key points from the assessment. Start the camera, then begin recording when ready.'}
          </p>
        </header>

        {error && (
          <div className={styles.errorBanner} role="alert">
            {error}
          </div>
        )}

        <div className={styles.videoSection}>
          {status === 'idle' && (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>▶</span>
              {connectionsStatus === 0 ? (
                <>
                  <p className={styles.warningText}>You need to update camera driver.</p>
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
          {status === 'idle' && (
            <button
              type="button"
              onClick={startCamera}
              className={styles.btnPrimary}
              disabled={connectionsStatus !== 2}
            >
              Start camera
            </button>
          )}
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
              <button type="button" onClick={downloadRecording} className={styles.btnPrimary}>
                Download recording
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
