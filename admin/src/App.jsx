import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import AddUser from "./pages/AddUser";
import ContentManagement from "./pages/ContentManagement";
import Products from "./pages/Products";
import ProductForm from "./pages/ProductForm";
import Schemes from "./pages/Schemes";
import SchemeForm from "./pages/SchemeForm";
import KnowledgeBase from "./pages/KnowledgeBase";
import ArticleForm from "./pages/ArticleForm";
import DistrictMaster from "./pages/DistrictMaster";
import AddDistrictMapping from "./pages/AddDistrictMapping";
import StoreTypeBreakup from "./pages/StoreTypeBreakup";
import UniverseMaster from "./pages/UniverseMaster";
import RetailerProfiler from "./pages/RetailerProfiler";
import FabricatorTracker from "./pages/FabricatorTracker";
import Profile from "./pages/Profile";
import Placeholder from "./pages/Placeholder";
import ProtectedRoute from "./routes/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/add"
        element={
          <ProtectedRoute>
            <AddUser />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/edit/:id"
        element={
          <ProtectedRoute>
            <AddUser />
          </ProtectedRoute>
        }
      />

      <Route
        path="/content"
        element={
          <ProtectedRoute>
            <ContentManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/content/products"
        element={
          <ProtectedRoute>
            <Products />
          </ProtectedRoute>
        }
      />
      <Route
        path="/content/products/add"
        element={
          <ProtectedRoute>
            <ProductForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/content/products/edit/:id"
        element={
          <ProtectedRoute>
            <ProductForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/content/schemes"
        element={
          <ProtectedRoute>
            <Schemes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/content/schemes/add"
        element={
          <ProtectedRoute>
            <SchemeForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/content/schemes/edit/:id"
        element={
          <ProtectedRoute>
            <SchemeForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/content/knowledge-base"
        element={
          <ProtectedRoute>
            <KnowledgeBase />
          </ProtectedRoute>
        }
      />
      <Route
        path="/content/knowledge-base/add"
        element={
          <ProtectedRoute>
            <ArticleForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/content/knowledge-base/edit/:id"
        element={
          <ProtectedRoute>
            <ArticleForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/master-data"
        element={
          <ProtectedRoute>
            <Placeholder title="Master Data" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/district-master"
        element={
          <ProtectedRoute>
            <DistrictMaster />
          </ProtectedRoute>
        }
      />
      <Route
        path="/district-master/add"
        element={
          <ProtectedRoute>
            <AddDistrictMapping />
          </ProtectedRoute>
        }
      />
      <Route
        path="/district-master/edit/:id"
        element={
          <ProtectedRoute>
            <AddDistrictMapping />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store-type-breakup"
        element={
          <ProtectedRoute>
            <StoreTypeBreakup />
          </ProtectedRoute>
        }
      />
      <Route
        path="/universe-master"
        element={
          <ProtectedRoute>
            <UniverseMaster />
          </ProtectedRoute>
        }
      />
      <Route
        path="/field-visit-tracker"
        element={
          <ProtectedRoute>
            <Placeholder title="Field Visit Tracker" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/retailer-profiler"
        element={
          <ProtectedRoute>
            <RetailerProfiler />
          </ProtectedRoute>
        }
      />
      <Route
        path="/fabricator"
        element={
          <ProtectedRoute>
            <FabricatorTracker />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
