import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LandingNavbar from '../components/landing/LandingNavbar'
import HeroSection from '../components/landing/HeroSection'
import FeaturesSection from '../components/landing/FeaturesSection'
import PricingSection from '../components/landing/PricingSection'
import FaqSection from '../components/landing/FaqSection'
import Footer from '../components/landing/Footer'
import LoginModal from '../components/landing/LoginModal'
import LegalModal from '../components/landing/LegalModal'

export default function LandingPage() {
  const { user } = useAuth()
  const [showLogin, setShowLogin] = useState(false)
  const [legalType, setLegalType] = useState(null)

  // Redirect authenticated users to the app
  if (user) return <Navigate to="/app" replace />

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text scroll-smooth">
      <LandingNavbar onLoginClick={() => setShowLogin(true)} />
      <HeroSection onLegalClick={(type) => setLegalType(type)} />
      <FeaturesSection />
      <PricingSection />
      <FaqSection />
      <Footer />
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
      <LegalModal type={legalType} onClose={() => setLegalType(null)} />
    </div>
  )
}
