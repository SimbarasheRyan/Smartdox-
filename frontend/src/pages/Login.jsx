import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await login(form.username, form.password)
      navigate('/')
    } catch {
      setError('Invalid username or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-brand-logo">S</div>
          <span className="auth-brand-name">Smartdox</span>
        </div>
        <div className="auth-hero">
          <h1 className="auth-hero-title">Court Records,<br /><span>Managed Smartly.</span></h1>
          <p className="auth-hero-sub">Secure, efficient file and records management for the JSC Commercial Court.</p>
          <div className="auth-pills">
            <span className="auth-pill">JSC Commercial Court</span>
            <span className="auth-pill">Role-Based Access</span>
            <span className="auth-pill">Document Versioning</span>
            <span className="auth-pill">Full Audit Trail</span>
          </div>
        </div>
        <div className="auth-left-footer">
          2025 JSC Commercial Court - Smartdox v1.0
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Welcome back</h2>
            <p>Sign in to your Smartdox account to continue</p>
          </div>
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Username</label>
              <input type="text" name="username" value={form.username} onChange={handleChange} placeholder="Enter your username" required autoFocus />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Enter your password" required />
            </div>
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : 'Sign In'}
            </button>
          </form>
          <div className="auth-footer">
            Don't have an account? <Link to="/register">Request access</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
