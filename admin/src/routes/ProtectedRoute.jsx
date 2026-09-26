import React from 'react'
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Loader from "../components/Loader";

const ProtectedRoute = ({ children, allowPasswordChange=false }) => {
    const { loading, isAuthenticated } = useSelector((state) => state.auth);
    if (loading) return <Loader />;
    if (!isAuthenticated) return <Navigate to={`/login`} replace />;
    return children;
}

export default React.memo(ProtectedRoute)