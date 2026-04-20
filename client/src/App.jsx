import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { setCredentials, logout } from './store/authSlice.js'
import { getMe } from './services/api.js'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import ProjectsPage from './pages/ProjectsPage.jsx'
import BoardPage from './pages/BoardPage.jsx'

// Redirect to login if not authenticated
function ProtectedRoute({ children }) {
  const { isLoggedIn } = useSelector((state) => state.auth)
  return isLoggedIn ? children : <Navigate to="/login" replace />
}

// Redirect to projects if already logged in
function PublicRoute({ children }) {
  const { isLoggedIn } = useSelector((state) => state.auth)
  return isLoggedIn ? <Navigate to="/projects" replace /> : children
}

function App() {
  const dispatch = useDispatch()
  const { token } = useSelector((state) => state.auth)

  // On app load, if a token exists rehydrate the user object from the server
  // This handles page refreshes where Redux state is lost but localStorage token remains
  useEffect(() => {
    if (token) {
      getMe()
        .then((res) => {
          dispatch(setCredentials({ user: res.data, token }))
        })
        .catch(() => {
          // Token is invalid or expired — clear everything and force re-login
          dispatch(logout())
        })
    }
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/projects" replace />} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
        <Route path="/projects/:projectId" element={<ProtectedRoute><BoardPage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
