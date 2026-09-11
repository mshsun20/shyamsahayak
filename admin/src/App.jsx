import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";

const Login = lazy(() => import("./pages/auth/Login"));
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));
const Users = lazy(() => import("./pages/users/Users"));
const AddUser = lazy(() => import("./pages/users/AddUser"));

const ContentManagement = lazy(() => import("./pages/content/ContentManagement"));
const Products = lazy(() => import("./pages/content/products/Products"));
const ProductForm = lazy(() => import("./pages/content/products/ProductForm"));
const Schemes = lazy(() => import("./pages/content/schemes/Schemes"));
const SchemeForm = lazy(() => import("./pages/content/schemes/SchemeForm"));
const KnowledgeBase = lazy(() => import("./pages/content/knowledge-base/KnowledgeBase"));
const ArticleForm = lazy(() => import("./pages/content/knowledge-base/ArticleForm"));

const DistrictMaster = lazy(() => import("./pages/masters/district/DistrictMaster"));
const AddDistrictMapping = lazy(() => import("./pages/masters/district/AddDistrictMapping"));
const StoreTypeBreakup = lazy(() => import("./pages/masters/store-type/StoreTypeBreakup"));
const UniverseMaster = lazy(() => import("./pages/masters/universe/UniverseMaster"));

const RetailerProfiler = lazy(() => import("./pages/field/RetailerProfiler"));
const FabricatorTracker = lazy(() => import("./pages/field/FabricatorTracker"));
const Profile = lazy(() => import("./pages/profile/Profile"));
const Placeholder = lazy(() => import("./pages/shared/Placeholder"));


export default function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

        <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
        <Route path="/users/add" element={<ProtectedRoute><AddUser /></ProtectedRoute>} />
        <Route path="/users/edit/:id" element={<ProtectedRoute><AddUser /></ProtectedRoute>} />

        <Route path="/content" element={<ProtectedRoute><ContentManagement /></ProtectedRoute>} />
        <Route path="/content/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
        <Route path="/content/products/add" element={<ProtectedRoute><ProductForm /></ProtectedRoute>} />
        <Route path="/content/products/edit/:id" element={<ProtectedRoute><ProductForm /></ProtectedRoute>} />
        <Route path="/content/schemes" element={<ProtectedRoute><Schemes /></ProtectedRoute>} />
        <Route path="/content/schemes/add" element={<ProtectedRoute><SchemeForm /></ProtectedRoute>} />
        <Route path="/content/schemes/edit/:id" element={<ProtectedRoute><SchemeForm /></ProtectedRoute>} />
        <Route path="/content/knowledge-base" element={<ProtectedRoute><KnowledgeBase /></ProtectedRoute>} />
        <Route path="/content/knowledge-base/add" element={<ProtectedRoute><ArticleForm /></ProtectedRoute>} />
        <Route path="/content/knowledge-base/edit/:id" element={<ProtectedRoute><ArticleForm /></ProtectedRoute>} />

        <Route path="/master-data" element={<ProtectedRoute><Placeholder title="Master Data" /></ProtectedRoute>} />
        <Route path="/district-master" element={<ProtectedRoute><DistrictMaster /></ProtectedRoute>} />
        <Route path="/district-master/add" element={<ProtectedRoute><AddDistrictMapping /></ProtectedRoute>} />
        <Route path="/district-master/edit/:id" element={<ProtectedRoute><AddDistrictMapping /></ProtectedRoute>} />
        <Route path="/store-type-breakup" element={<ProtectedRoute><StoreTypeBreakup /></ProtectedRoute>} />
        <Route path="/universe-master" element={<ProtectedRoute><UniverseMaster /></ProtectedRoute>} />
        <Route path="/field-visit-tracker" element={<ProtectedRoute><Placeholder title="Field Visit Tracker" /></ProtectedRoute>} />
        <Route path="/retailer-profiler" element={<ProtectedRoute><RetailerProfiler /></ProtectedRoute>} />
        <Route path="/fabricator" element={<ProtectedRoute><FabricatorTracker /></ProtectedRoute>} />

        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}