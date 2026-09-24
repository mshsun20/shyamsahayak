import React from 'react'
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Loader from "../components/Loader";

const ProtectedRoute = ({ children, allowPasswordChange=false }) => {
    const { loading, isAuthenticated } = useSelector((state) => state.auth);
    console.log(loading);
    console.log(isAuthenticated);
    if (loading) return <Loader />;
    if (!isAuthenticated) return <Navigate to={`/login`} replace />;
    // if (user?.passwordChangeFlag && !allowPasswordChange) return <Navigate to={`/change-password`} replace />;
    return children;
}

export default React.memo(ProtectedRoute)