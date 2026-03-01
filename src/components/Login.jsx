import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [mode, setMode] = useState('signin') // 'signin' or 'signup'

  async function signIn(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else if (data.user) {
      onLogin && onLogin(data.user)
    }
  }

  async function signUp(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { data, error } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else if (data.user) {
      setError(null)
      setEmail('')
      setPassword('')
      setMode('signin')
      // Show success message
      if (!data.user.confirmed_at) {
        setError('Sign up successful! Please check your email to confirm.')
      } else {
        onLogin && onLogin(data.user)
      }
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (mode === 'signin') {
      signIn(e)
    } else {
      signUp(e)
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">BruinPlan</h1>
        <p className="login-subtitle">Your Academic Planner</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              id="email"
              type="email"
              placeholder="your@email.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              id="password"
              type="password"
              placeholder="••••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {error && <div className="form-error">{error}</div>}

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
          >
            {loading ? 'Loading...' : (mode === 'signin' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="auth-toggle">
          <p>
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button 
              type="button"
              className="btn-link"
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin')
                setError(null)
                setPassword('')
              }}
              disabled={loading}
            >
              {mode === 'signin' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
