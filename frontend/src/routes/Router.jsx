import React from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
const Layout = React.lazy(() => import("../components/Layout"));
const Login = React.lazy(() => import("../pages/Login"));
const Dashboard = React.lazy(() => import("../pages/Dashboard"));

const router = createBrowserRouter([
    { path: "/login", element: <Login /> },
    {
        path: "/",
        element: <Layout />,
        errorElement: <div>404! Page not found.</div>,
        children: [
            { index: true, element: <Navigate to="/dashboard" replace /> },
            { path: "/dashboard", element: <Dashboard /> },
        ]
    },
])

const Router = () => {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
        <RouterProvider router={router} />
    </React.Suspense>
  )
}

export default Router