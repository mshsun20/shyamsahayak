import React from 'react'
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Loader from "../components/Loader";

const PublicRoute = ({ children }) => {
    const { loading, isAuthenticated, user } = useSelector((state) => state.auth);
    if (loading) return <Loader />;
    if (isAuthenticated) {
        return <Navigate to={`/dashboard`} replace />;
    }
    return children;
}

export default React.memo(PublicRoute)