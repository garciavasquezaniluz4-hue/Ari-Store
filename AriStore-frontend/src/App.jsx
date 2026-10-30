import { useState } from 'react'
import Account from './page/account.jsx'
import Login from './page/login.jsx'
import { getSession, logout } from './services/auth.js'

function App() {
  const [session, setSession] = useState(() => getSession())

  const handleLoginSuccess = (email) => {
    setSession({ email, startedAt: Date.now() })
  }

  const handleLogout = () => {
    logout()
    setSession(null)
  }

  if (!session) {
    return <Login onLoginSuccess={handleLoginSuccess} />
  }

  return <Account email={session.email} onLogout={handleLogout} />
}

export default App
