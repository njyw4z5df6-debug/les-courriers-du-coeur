import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { HomePage } from './pages/HomePage'
import { ModerationPage } from './pages/ModerationPage'
import { AccountPage } from './pages/AccountPage'

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'

  if (path === '/moderation') {
    return <ModerationPage />
  }

  if (path === '/compte') {
    return (
      <>
        <Header />
        <AccountPage />
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <HomePage />
      <Footer />
    </>
  )
}
