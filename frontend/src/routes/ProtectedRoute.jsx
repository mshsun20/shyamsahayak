import React from 'react'
import { Navigate } from 'react-router';
import { useSelector } from 'react-redux';
import Loader from "../components/Loader";

const ProtectedRoute = ({ children }) => {
    const { loading, isAuthenticated } = useSelector((state) => state.auth);
    if (loading) return <Loader />
    if (!isAuthenticated) return <Navigate to={`/login`} replace />
    return children;
}

export default React.memo(ProtectedRoute)