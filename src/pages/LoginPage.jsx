import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import LoginForm from '../components/auth/LoginForm'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const { user, login, error, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate('/app', { replace: true })
  }, [user, navigate])

  const handleLogin = (email, password) => {
    const success = login(email, password)
    if (success) navigate('/app')
  }

  return <LoginForm onLogin={handleLogin} error={error} loading={loading} />
}
