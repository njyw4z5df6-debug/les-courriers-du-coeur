import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { HomePage } from './pages/HomePage'
import { ModerationPage } from './pages/ModerationPage'

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'

  if (path === '/moderation') {
    return <ModerationPage />
  }

  return (
    <>
      <Header />
      <HomePage />
      <Footer />
    </>
  )
}
