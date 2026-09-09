import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import AddUser from "./pages/AddUser";
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
            <Placeholder title="Content Management" />
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
            <Placeholder title="District Master" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store-type-breakup"
        element={
          <ProtectedRoute>
            <Placeholder title="Store Type Breakup" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/universe-master"
        element={
          <ProtectedRoute>
            <Placeholder title="Universe Master" />
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
            <Placeholder title="Retailer + Profiler" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/fabricator"
        element={
          <ProtectedRoute>
            <Placeholder title="Fabricator" />
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
