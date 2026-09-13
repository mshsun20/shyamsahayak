import React from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import PublicsRoute from "./PublicRoute";
import ProtectedRoute from "./ProtectedRoute";
// import Loader from "../components/Loader";
const Loader = React.lazy(() => import("../components/Loader"));
const Layout = React.lazy(() => import("../components/Layout"));
const Login = React.lazy(() => import("../pages/Login"));
const ChangePassword = React.lazy(() => import("../pages/ChangePassword"));
const Profile = React.lazy(() => import("../pages/profile/Profile"));
const Dashboard = React.lazy(() => import("../pages/Dashboard"));
const ChatScreen = React.lazy(() => import("../pages/ChatScreen"));
const RecentConversationsScreen = React.lazy(() => import("../pages/RecentConversationsScreen"));
const Performance = React.lazy(() => import("../pages/performance/Performance"));
const Fabricators = React.lazy(() => import("../pages/performance/Fabricators"));
const FabricatorDetail = React.lazy(() => import("../pages/performance/FabricatorDetail"));
const Visits = React.lazy(() => import("../pages/performance/Visits"));
const CounterDetail = React.lazy(() => import("../pages/performance/CounterDetail"));
const TmPerformance = React.lazy(() => import("../pages/performance/tm/Performance"));
const TmDgos = React.lazy(() => import("../pages/performance/tm/Dgos"));
const TmDgoDetail = React.lazy(() => import("../pages/performance/tm/DgoDetail"));
const TmFabricators = React.lazy(() => import("../pages/performance/tm/Fabricators"));
const TmFabricatorDetail = React.lazy(() => import("../pages/performance/tm/FabricatorDetail"));
const TmVisits = React.lazy(() => import("../pages/performance/tm/Visits"));
const TmCounterDetail = React.lazy(() => import("../pages/performance/tm/CounterDetail"));
const Calculator = React.lazy(() => import("../pages/calculator/Calculator"));
const KnowledgeBase = React.lazy(() => import("../pages/knowledge-base/KnowledgeBase"));
const Installation = React.lazy(() => import("../pages/knowledge-base/Installation"));
const InstallationDetail = React.lazy(() => import("../pages/knowledge-base/InstallationDetail"));

const router = createBrowserRouter([
    { path: "/login", element: <PublicsRoute><Login /></PublicsRoute> },
    {
        path: "/",
        element: <Layout />,
        errorElement: <div>404! Page not found.</div>,
        children: [
            { index: true, element: <Navigate to="/dashboard" replace /> },
            { path: "/profile", element: <ProtectedRoute><Profile /></ProtectedRoute> },
            { path: "/change-password", element: <ProtectedRoute allowPasswordChange={true}><ChangePassword /></ProtectedRoute> },
            { path: "/dashboard", element: <ProtectedRoute><Dashboard /></ProtectedRoute> },
            { path: "/chat", element: <ProtectedRoute><ChatScreen /></ProtectedRoute> },
            { path: "/recent-conversations", element: <ProtectedRoute><RecentConversationsScreen /></ProtectedRoute> },
            { path: "/performance", element: <ProtectedRoute><Performance /></ProtectedRoute> },
            { path: "/fabricators", element: <ProtectedRoute><Fabricators /></ProtectedRoute> },
            { path: "/fabricators/:id", element: <ProtectedRoute><FabricatorDetail /></ProtectedRoute> },
            { path: "/visits", element: <ProtectedRoute><Visits /></ProtectedRoute> },
            { path: "/visits/:id", element: <ProtectedRoute><CounterDetail /></ProtectedRoute> },
            { path: "/calculator", element: <ProtectedRoute><Calculator /></ProtectedRoute> },
            { path: "/tm/performance", element: <ProtectedRoute><TmPerformance /></ProtectedRoute> },
            { path: "/tm/dgos", element: <ProtectedRoute><TmDgos /></ProtectedRoute> },
            { path: "/tm/dgos/:id", element: <ProtectedRoute><TmDgoDetail /></ProtectedRoute> },
            { path: "/tm/fabricators", element: <ProtectedRoute><TmFabricators /></ProtectedRoute> },
            { path: "/tm/fabricators/:id", element: <ProtectedRoute><TmFabricatorDetail /></ProtectedRoute> },
            { path: "/tm/visits", element: <ProtectedRoute><TmVisits /></ProtectedRoute> },
            { path: "/tm/visits/:id", element: <ProtectedRoute><TmCounterDetail /></ProtectedRoute> },
            { path: "/knowledge-base", element: <ProtectedRoute><KnowledgeBase /></ProtectedRoute> },
            { path: "/knowledge-base/installation", element: <ProtectedRoute><Installation /></ProtectedRoute> },
            { path: "/knowledge-base/installation/:id", element: <ProtectedRoute><InstallationDetail /></ProtectedRoute> },
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