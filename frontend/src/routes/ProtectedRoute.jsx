import React from 'react'
import { Navigate } from 'react-router';
import { useSelector } from 'react-redux';
import Loader from "../components/Loader";

const ProtectedRoute = ({ children, allowPasswordChange=false }) => {
    const { loading, isAuthenticated, user } = useSelector((state) => state.auth);
    if (loading) return <Loader />;
    if (!isAuthenticated) return <Navigate to={`/login`} replace />;
    if (user?.passwordChangeFlag && !allowPasswordChange) return <Navigate to={`/change-password`} replace />;
    return children;
}

export default React.memo(ProtectedRoute)