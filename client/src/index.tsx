import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './components/App.tsx'
import Login from './components/Login.tsx'
import CreateAccount from './components/CreateAccount.tsx'
import { 
  createBrowserRouter,
  RouterProvider
} from 'react-router-dom'
import "react-contexify/dist/ReactContexify.css";
import './index.css'
import Main from './components/main/Main.tsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "login",
        element: <Login />
      },
      {
        path: "create",
        element: <CreateAccount />
      },
      {
        path: "main",
        element: <Main />
      }
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
