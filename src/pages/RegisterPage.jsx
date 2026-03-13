import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import RegisterForm from '../components/auth/RegisterForm'
import { useAuth } from '../hooks/useAuth'

export default function RegisterPage() {
  const { user, register, error, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate('/app', { replace: true })
  }, [user, navigate])

  const handleRegister = (email, password, fullName) => {
    const success = register(email, password, fullName)
    if (success) navigate('/app')
  }

  return <RegisterForm onRegister={handleRegister} error={error} loading={loading} />
}
