import React from "react";
import { Routes, Route, Navigate, createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "../components/Layout";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicsRoute";
import Loader from "../components/Loader";

const Login = React.lazy(() => import("../pages/auth/Login"));
const Dashboard = React.lazy(() => import("../pages/dashboard/Dashboard"));
const Users = React.lazy(() => import("../pages/users/Users"));
const AddUser = React.lazy(() => import("../pages/users/AddUser"));

const ContentManagement = React.lazy(() => import("../pages/content/ContentManagement"));
const Products = React.lazy(() => import("../pages/content/products/Products"));
const ProductForm = React.lazy(() => import("../pages/content/products/ProductForm"));
const Schemes = React.lazy(() => import("../pages/content/schemes/Schemes"));
const SchemeForm = React.lazy(() => import("../pages/content/schemes/SchemeForm"));
const KnowledgeBase = React.lazy(() => import("../pages/content/knowledge-base/KnowledgeBase"));
const ArticleForm = React.lazy(() => import("../pages/content/knowledge-base/ArticleForm"));

const DistrictMaster = React.lazy(() => import("../pages/masters/district/DistrictMaster"));
const AddDistrictMapping = React.lazy(() => import("../pages/masters/district/AddDistrictMapping"));
const StoreTypeBreakup = React.lazy(() => import("../pages/masters/store-type/StoreTypeBreakup"));
const UniverseMaster = React.lazy(() => import("../pages/masters/universe/UniverseMaster"));

const RetailerProfiler = React.lazy(() => import("../pages/field/RetailerProfiler"));
const FabricatorTracker = React.lazy(() => import("../pages/field/FabricatorTracker"));
const Profile = React.lazy(() => import("../pages/profile/Profile"));
const Placeholder = React.lazy(() => import("../pages/shared/Placeholder"));



// export default function Router() {
//   return (
//     <Suspense fallback={<div>Loading...</div>}>
//       <Routes>
//         <Route path="/" element={<Navigate to="/login" replace />} />
//         <Route path="/login" element={<Login />} />

//         <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

//         <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
//         <Route path="/users/add" element={<ProtectedRoute><AddUser /></ProtectedRoute>} />
//         <Route path="/users/edit/:id" element={<ProtectedRoute><AddUser /></ProtectedRoute>} />

//         <Route path="/content" element={<ProtectedRoute><ContentManagement /></ProtectedRoute>} />
//         <Route path="/content/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
//         <Route path="/content/products/add" element={<ProtectedRoute><ProductForm /></ProtectedRoute>} />
//         <Route path="/content/products/edit/:id" element={<ProtectedRoute><ProductForm /></ProtectedRoute>} />
//         <Route path="/content/schemes" element={<ProtectedRoute><Schemes /></ProtectedRoute>} />
//         <Route path="/content/schemes/add" element={<ProtectedRoute><SchemeForm /></ProtectedRoute>} />
//         <Route path="/content/schemes/edit/:id" element={<ProtectedRoute><SchemeForm /></ProtectedRoute>} />
//         <Route path="/content/knowledge-base" element={<ProtectedRoute><KnowledgeBase /></ProtectedRoute>} />
//         <Route path="/content/knowledge-base/add" element={<ProtectedRoute><ArticleForm /></ProtectedRoute>} />
//         <Route path="/content/knowledge-base/edit/:id" element={<ProtectedRoute><ArticleForm /></ProtectedRoute>} />

//         <Route path="/master-data" element={<ProtectedRoute><Placeholder title="Master Data" /></ProtectedRoute>} />
//         <Route path="/district-master" element={<ProtectedRoute><DistrictMaster /></ProtectedRoute>} />
//         <Route path="/district-master/add" element={<ProtectedRoute><AddDistrictMapping /></ProtectedRoute>} />
//         <Route path="/district-master/edit/:id" element={<ProtectedRoute><AddDistrictMapping /></ProtectedRoute>} />
//         <Route path="/store-type-breakup" element={<ProtectedRoute><StoreTypeBreakup /></ProtectedRoute>} />
//         <Route path="/universe-master" element={<ProtectedRoute><UniverseMaster /></ProtectedRoute>} />
//         <Route path="/field-visit-tracker" element={<ProtectedRoute><Placeholder title="Field Visit Tracker" /></ProtectedRoute>} />
//         <Route path="/retailer-profiler" element={<ProtectedRoute><RetailerProfiler /></ProtectedRoute>} />
//         <Route path="/fabricator" element={<ProtectedRoute><FabricatorTracker /></ProtectedRoute>} />

//         <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

//         <Route path="*" element={<Navigate to="/login" replace />} />
//       </Routes>
//     </Suspense>
//   );
// }


const router = createBrowserRouter([
  { path: "/login", element: <PublicRoute><Login /></PublicRoute> },

  {
    path: "/",
    element: <Layout />,
    errorElement: <div>404! Page not found.</div>,

    children: [
      // Root
      { index: true, element: <Navigate to="/dashboard" replace /> },
      // Dashboard
      { path: "dashboard", element: <ProtectedRoute><Dashboard /></ProtectedRoute> },
      // =========================
      // USERS
      // =========================
      { path: "users", element: <ProtectedRoute><Users /></ProtectedRoute> },
      { path: "users/add", element: <ProtectedRoute><AddUser /></ProtectedRoute> },
      { path: "users/edit/:id", element: <ProtectedRoute><AddUser /></ProtectedRoute> },
      // =========================
      // CONTENT MANAGEMENT
      // =========================
      { path: "content", element: <ProtectedRoute><ContentManagement /></ProtectedRoute> },
      // Products
      { path: "content/products", element: <ProtectedRoute><Products /></ProtectedRoute> },
      { path: "content/products/add", element: <ProtectedRoute><ProductForm /></ProtectedRoute> },
      { path: "content/products/edit/:id", element: <ProtectedRoute><ProductForm /></ProtectedRoute> },
      // Schemes
      { path: "content/schemes", element: <ProtectedRoute><Schemes /></ProtectedRoute> },
      { path: "content/schemes/add", element: <ProtectedRoute><SchemeForm /></ProtectedRoute> },
      { path: "content/schemes/edit/:id", element: <ProtectedRoute><SchemeForm /></ProtectedRoute> },
      // Knowledge Base
      { path: "content/knowledge-base", element: <ProtectedRoute><KnowledgeBase /></ProtectedRoute> },
      { path: "content/knowledge-base/add", element: <ProtectedRoute><ArticleForm /></ProtectedRoute> },
      { path: "content/knowledge-base/edit/:id", element: <ProtectedRoute><ArticleForm /></ProtectedRoute> },
      // =========================
      // MASTER DATA
      // =========================
      { path: "master-data", element: <ProtectedRoute><Placeholder title="Master Data" /></ProtectedRoute> },
      // District Master
      { path: "district-master", element: <ProtectedRoute><DistrictMaster /></ProtectedRoute> },
      { path: "district-master/add", element: <ProtectedRoute><AddDistrictMapping /></ProtectedRoute> },
      { path: "district-master/edit/:id", element: <ProtectedRoute><AddDistrictMapping /></ProtectedRoute> },
      // Store Type
      { path: "store-type-breakup", element: <ProtectedRoute><StoreTypeBreakup /></ProtectedRoute> },
      // Universe
      { path: "universe-master", element: <ProtectedRoute><UniverseMaster /></ProtectedRoute> },
      // =========================
      // FIELD
      // =========================
      { path: "field-visit-tracker", element: <ProtectedRoute><Placeholder title="Field Visit Tracker" /></ProtectedRoute> },
      { path: "retailer-profiler", element: <ProtectedRoute><RetailerProfiler /></ProtectedRoute> },
      { path: "fabricator", element: <ProtectedRoute><FabricatorTracker /></ProtectedRoute> },
      // =========================
      // PROFILE
      // =========================
      { path: "profile", element: <ProtectedRoute><Profile /></ProtectedRoute> },
    ],
  },

  // =========================
  // FALLBACK
  // =========================
  { path: "*", element: <Navigate to="/login" replace /> },
], { basename: "/admin" })

const Router = () => {
  return (
    <React.Suspense fallback={<Loader />}>
      <RouterProvider router={router} />
    </React.Suspense>
  )
}

export default Router