import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './SignUp.module.css'

const WORK_EXPERIENCE_OPTIONS = [
  { value: '', label: 'Select' },
  { value: '3+', label: '3+' },
  { value: '5+', label: '5+' },
  { value: '7+', label: '7+' },
  { value: '10+', label: '10+' },
  { value: '15+', label: '15+' },
  { value: '20+', label: '20+' },
]

const GENDERS = [
  { value: '', label: 'Select' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
]

export default function SignUp({ canContinue = true, inviteLink, positionTitle }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    email: '',
    fullName: '',
    experienceYears: '',
    socialLink: '',
    gender: '',
  })
  const [touched, setTouched] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleBlur = (e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }))
  }

  const validate = () => {
    const err = {}
    if (!form.email.trim()) err.email = 'Email address is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) err.email = 'Please enter a valid email address.'
    if (!form.fullName.trim()) err.fullName = 'Full name is required.'
    if (!form.experienceYears) err.experienceYears = 'Work experience is required.'
    if (!form.socialLink.trim()) err.socialLink = 'Social link is required.'
    return err
  }

  const [errors, setErrors] = useState({})

  const handleSubmit = (e) => {
    e.preventDefault()
    const err = validate()
    setErrors(err)
    setTouched({ email: true, fullName: true, experienceYears: true, socialLink: true })
    if (Object.keys(err).length > 0) return

    const candidate = { ...form, agreed: false, registeredAt: new Date().toISOString() }
    try {
      localStorage.setItem('assessment_candidate', JSON.stringify(candidate))
    } catch (_) {}

    navigate(inviteLink ? `/invite/${inviteLink}/instructions` : '/')
  }

  const getError = (name) => touched[name] && errors[name]

  return (
    <div className={styles.page}>
      <div className={styles.wrapper}>
        {/* Left: Welcome and pre-assessment instructions (like first image) */}
        <section className={styles.intro}>
          <h1 className={styles.title}>
            Let's Get Started — <span className={styles.titleHighlight}>Your Challenge Awaits</span>
          </h1>
          <p className={styles.introBody}>
            You've been invited to complete the hiring evaluation. This test is hosted via our
            secure platform and is designed to help us better understand your skills and potential fit.
          </p>
          <div className={styles.metaBox}>
            <div className={styles.metaRow}>
              <span className={styles.infoLabel}>Date:</span>
              <span className={styles.infoValue}>
                {new Date().toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.infoLabel}>Position title:</span>
              <span className={styles.infoValue}>{positionTitle || '—'}</span>
            </div>
          </div>

          <div className={styles.noteBox}>
            <p className={styles.noteText}>
              <strong>NOTE:</strong> Please take up the test in Incognito window to avoid browser
              extensions/plugins interference and ensure a seamless test experience.
            </p>
          </div>

          <p className={styles.welcomeText}>
            We hope you have a great time taking
            this assessment. Answer the questions within this assessment to the best of your ability.
          </p>

          <h2 className={styles.beforeStartHeading}>
            Before you start with the assessment, make sure to:
          </h2>
          <ul className={styles.beforeStartList}>
            <li>Take up this assessment on a laptop or desktop rather than on a mobile phone.</li>
            <li>Close all other applications and browser tabs to ensure no distractions.</li>
            <li>
              Block time to start and finish the assessment in one go. Please make sure you are not
              interrupted.
            </li>
          </ul>

          <p className={styles.allTheBest}>All the best!</p>

          <p className={styles.ruleText}>
            You can take up this test <strong>anytime</strong> you want. But once you start the
            test, you must <strong>not leave the assessment page</strong>.
          </p>
        </section>

        {/* Right: Form */}
        <section className={styles.formSection}>
          <p className={styles.formIntro}>
            Before we start, here is some extra information we need to assess you better.
          </p>

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles.field}>
              <label htmlFor="email">
                Email address <span className={styles.required}>*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email address"
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getError('email') ? styles.inputError : ''}
                autoComplete="email"
              />
              {getError('email') && <span className={styles.error}>{errors.email}</span>}
            </div>

            <div className={styles.field}>
              <label htmlFor="fullName">
                Full Name <span className={styles.required}>*</span>
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Enter your full name"
                value={form.fullName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getError('fullName') ? styles.inputError : ''}
                autoComplete="name"
              />
              {getError('fullName') && <span className={styles.error}>{errors.fullName}</span>}
            </div>

            <div className={styles.field}>
              <label htmlFor="experienceYears">
                Work Experience (in years) <span className={styles.required}>*</span>
              </label>
              <select
                id="experienceYears"
                name="experienceYears"
                value={form.experienceYears}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getError('experienceYears') ? styles.inputError : ''}
              >
                {WORK_EXPERIENCE_OPTIONS.map((opt) => (
                  <option key={opt.value || 'empty'} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {getError('experienceYears') && (
                <span className={styles.error}>{errors.experienceYears}</span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="socialLink">
                Social Links (LinkedIn, Twitter, ...) <span className={styles.required}>*</span>
              </label>
              <input
                id="socialLink"
                name="socialLink"
                type="url"
                placeholder="Enter your social link"
                value={form.socialLink}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getError('socialLink') ? styles.inputError : ''}
                autoComplete="url"
              />
              {getError('socialLink') && <span className={styles.error}>{errors.socialLink}</span>}
            </div>

            <div className={styles.demoSection}>
              <h3 className={styles.demoTitle}>DEMOGRAPHIC INFORMATION (OPTIONAL)</h3>
              <p className={styles.demoDisclaimer}>
                The following information is kept confidential and will only be used to help us
                foster a diverse and inclusive community.
              </p>
              <div className={styles.field}>
                <label htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getError('gender') ? styles.inputError : ''}
                >
                  {GENDERS.map((opt) => (
                    <option key={opt.value || 'empty'} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {getError('gender') && <span className={styles.error}>{errors.gender}</span>}
              </div>
            </div>

            <button
              type="submit"
              className={styles.submit}
              disabled={!canContinue}
              title={!canContinue ? 'This invite link is no longer available for new connections.' : undefined}
            >
              Continue
            </button>
            {!canContinue && (
              <p className={styles.continueDisabled}>
                This invite link is not available for new connections. (Connection limit reached.)
              </p>
            )}
          </form>
        </section>
      </div>
    </div>
  )
}
