import { Analytics } from '@vercel/analytics/react'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { HomePage } from './pages/HomePage'
import { ModerationPage } from './pages/ModerationPage'
import { AccountPage } from './pages/AccountPage'
import { WritePage } from './pages/WritePage'
import { ThemePage, themePages } from './pages/ThemePage'
import { EclairagesPage } from './pages/EclairagesPage'

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'

  if (path.startsWith('/themes/')) {
    const slug = path.slice('/themes/'.length)
    if (themePages.some((theme) => theme.slug === slug)) return <><Header /><ThemePage slug={slug} /><Footer /><Analytics /></>
  }

  if (path === '/eclairages') return <><Header /><EclairagesPage /><Footer /><Analytics /></>
  if (path.startsWith('/eclairages/')) return <><Header /><EclairagesPage slug={path.slice('/eclairages/'.length)} /><Footer /><Analytics /></>

  if (path === '/moderation') {
    return (
      <>
        <ModerationPage />
      </>
    )
  }

  if (path === '/ecrire') {
    return (
      <>
        <Header />
        <WritePage />
        <Footer />
        <Analytics />
      </>
    )
  }

  if (path === '/compte') {
    return (
      <>
        <Header />
        <AccountPage />
        <Footer />
        <Analytics />
      </>
    )
  }

  return (
    <>
      <Header />
      <HomePage />
      <Footer />
      <Analytics />
    </>
  )
}
