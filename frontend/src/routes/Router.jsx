import React from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
// import Loader from "../components/Loader";
const Loader = React.lazy(() => import("../components/Loader"));
const Layout = React.lazy(() => import("../components/Layout"));
const Login = React.lazy(() => import("../pages/Login"));
const Profile = React.lazy(() => import("../pages/profile/Profile"));
const Dashboard = React.lazy(() => import("../pages/Dashboard"));
const ChatScreen = React.lazy(() => import("../pages/ChatScreen"));
const RecentConversationsScreen = React.lazy(() => import("../pages/RecentConversationsScreen"));
const Performance = React.lazy(() => import("../pages/performance/Performance"));
const Fabricators = React.lazy(() => import("../pages/performance/Fabricators"));
const FabricatorDetail = React.lazy(() => import("../pages/performance/FabricatorDetail"));
const Visits = React.lazy(() => import("../pages/performance/Visits"));
const CounterDetail = React.lazy(() => import("../pages/performance/CounterDetail"));
const Calculator = React.lazy(() => import("../pages/calculator/Calculator"));
const KnowledgeBase = React.lazy(() => import("../pages/knowledge-base/KnowledgeBase"));
const Installation = React.lazy(() => import("../pages/knowledge-base/Installation"));
const InstallationDetail = React.lazy(() => import("../pages/knowledge-base/InstallationDetail"));

const router = createBrowserRouter([
    { path: "/login", element: <Login /> },
    {
        path: "/",
        element: <Layout />,
        errorElement: <div>404! Page not found.</div>,
        children: [
            { index: true, element: <Navigate to="/dashboard" replace /> },
            { path: "/profile", element: <Profile /> },
            { path: "/dashboard", element: <Dashboard /> },
            { path: "/chat", element: <ChatScreen /> },
            { path: "/recent-conversations", element: <RecentConversationsScreen /> },
            { path: "/performance", element: <Performance /> },
            { path: "/fabricators", element: <Fabricators /> },
            { path: "/fabricators/:id", element: <FabricatorDetail /> },
            { path: "/visits", element: <Visits /> },
            { path: "/visits/:id", element: <CounterDetail /> },
            { path: "/calculator", element: <Calculator /> },
            { path: "/knowledge-base", element: <KnowledgeBase /> },
            { path: "/knowledge-base/installation", element: <Installation /> },
            { path: "/knowledge-base/installation/:id", element: <InstallationDetail /> },
        ]
    },
])

const Router = () => {
  return (
    <React.Suspense fallback={<Loader />}>
        <RouterProvider router={router} />
    </React.Suspense>
  )
}

export default Router