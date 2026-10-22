import { StrictMode, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Login from './pages/login.tsx'
import Landing from './pages/landing.tsx'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { IsAuthenticated } from './client/src/libs/request_center.ts'

function ProtectRoute({ children }: { children: ReactNode }) {

  if (!IsAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}


const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/login', element: <Login.Page /> },
  { path: '/home', element: (<ProtectRoute><Landing.Page /></ProtectRoute>) }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className='bg-background w-screen h-screen'>
      <link href='/src/index.css' rel='stylesheet'></link>
      <RouterProvider router={router} />
    </div>
  </StrictMode>,
)
