import React from 'react'
import { createRoot } from 'react-dom/client'
import { Home } from './components/Home'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { LocalGame } from './components/LocalGame'
import { Online } from './components/Online'
import { Lobby } from './components/Lobby'
import { GameRoom } from './components/GameRoom'
import { Redirect } from '@8thday/react'
import { NhostClient, NhostProvider, SignedIn, SignedOut } from '@nhost/react'
import { Toaster } from 'react-hot-toast'
import { App } from './components/App'
import { Profile } from './components/Profile'
import { LoginForm } from './components/LoginForm'
import { AuthGuard } from './components/AuthGuard'
import { ResetPassword } from './components/ResetPassword'

export const nhost = new NhostClient({
  subdomain: process.env.REACT_APP_NHOST_SUBDOMAIN,
  region: process.env.REACT_APP_NHOST_REGION,
  clientStorageType: 'cookie',
})

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'profile',
        element: (
          <AuthGuard>
            <Profile />
          </AuthGuard>
        ),
      },
      {
        path: 'local',
        element: <LocalGame />,
      },
      {
        path: 'online',
        element: <Online />,
        children: [
          {
            path: 'login',
            element: (
              <AuthGuard redirectTo="lobby" invertGuard>
                <LoginForm />
              </AuthGuard>
            ),
          },
          {
            path: 'reset-password',
            element: <ResetPassword />,
          },
          {
            path: 'lobby',
            element: (
              <AuthGuard>
                <Lobby />
              </AuthGuard>
            ),
          },
          {
            path: 'room/:roomId',
            element: (
              <AuthGuard>
                <GameRoom />
              </AuthGuard>
            ),
          },
          {
            path: '',
            element: (
              <>
                <SignedOut>
                  <Redirect to="login" />
                </SignedOut>
                <SignedIn>
                  <Redirect to="lobby" />
                </SignedIn>
              </>
            ),
          },
          {
            path: '*',
            element: <Redirect to="lobby" />,
          },
        ],
      },
      {
        path: '*',
        element: <Redirect to="" />,
      },
    ],
  },
])

const root = createRoot(document.getElementById('app')!)

root.render(
  <NhostProvider nhost={nhost}>
    <Toaster position="top-right" containerClassName="mt-12" />
    <RouterProvider router={router} />
  </NhostProvider>,
)
