import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { OperationalInquiryProvider } from './components/inquiry/OperationalInquiryContext'
import { OperationalInquirySurface } from './components/inquiry/OperationalInquirySurface'
import HomePage from './pages/HomePage'
import LandingPage from './pages/LandingPage'
import ProviderPage from './pages/ProviderPage'

const AboutPage = lazy(() => import('./pages/AboutPage.tsx'))
const MethodologyPage = lazy(() => import('./pages/MethodologyPage.tsx'))
const ContactPage = lazy(() => import('./pages/ContactPage.tsx'))
const CoveragePage = lazy(() => import('./pages/CoveragePage.tsx'))

function RouteFallback() {
  return (
    <div
      className="flex min-h-[50vh] flex-col items-center justify-center bg-cwr-bg px-4 text-sm text-cwr-muted"
      role="status"
      aria-live="polite"
    >
      Loading page…
    </div>
  )
}

export default function App() {
  return (
    <OperationalInquiryProvider>
      <BrowserRouter>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/methodology" element={<MethodologyPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/coverage" element={<CoveragePage />} />
            <Route path="/alberta-coverage" element={<Navigate to="/coverage" replace />} />
            <Route path="/provider/:providerSlug" element={<ProviderPage />} />
            <Route path="/:segmentSlug/:citySlug" element={<LandingPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <OperationalInquirySurface />
      </BrowserRouter>
    </OperationalInquiryProvider>
  )
}
