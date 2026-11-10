import { useState } from 'react'
import Account from './page/account.jsx'
import Admin from './page/admin.jsx'
import Login from './page/login.jsx'
import Register from './page/register.jsx'
import { getSession, logout } from './services/auth.js'

function App() {
  const [session, setSession] = useState(() => getSession())
  const [view, setView] = useState('account')
  const [authView, setAuthView] = useState('login')

  const handleLoginSuccess = (email) => {
    setSession({ email, startedAt: Date.now() })
    setView('account')
    setAuthView('login')
  }

  const handleLogout = () => {
    logout()
    setSession(null)
    setView('account')
    setAuthView('login')
  }

  if (!session) {
    if (authView === 'register') {
      return (
        <Register
          onRegisterSuccess={handleLoginSuccess}
          onBackToLogin={() => setAuthView('login')}
        />
      )
    }

    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onRegisterClick={() => setAuthView('register')}
      />
    )
  }

  if (view === 'admin') {
    return (
      <Admin
        email={session.email}
        onBack={() => setView('account')}
        onLogout={handleLogout}
      />
    )
  }

  return (
    <Account
      email={session.email}
      onLogout={handleLogout}
      onOpenAdmin={() => setView('admin')}
    />
  )
}

export default App
