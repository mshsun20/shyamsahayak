import React from 'react'
import "./App.css";
import Router from "./routes/Router";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth } from './redux/slices/authSlice';
import Loader from './components/Loader';
import Snackbar from "./components/Snackbar";

const App = () => {
  const dispatch = useDispatch();
  const { loading, isAuthenticated } = useSelector((state) => state.auth);
  
  React.useEffect(() => {
    if (!isAuthenticated) {
      dispatch(checkAuth());
    }
  }, [dispatch, isAuthenticated]);

  if (loading) return <Loader />    
  return <>
    <Router />
    <Snackbar />
  </>
}

export default App