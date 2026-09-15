import React from 'react'
import "./App.css";
import Router from "./routes/Router";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth } from './redux/slices/authSlice';
import Loader from './components/Loader';
import Snackbar from "./components/Snackbar";
import CustomFavIcon from "./assets/favicon1.ico";

const App = () => {
  const dispatch = useDispatch();
  const { loading, isAuthenticated } = useSelector((state) => state.auth);
  
  React.useEffect(() => {
    let link = document.querySelector("link[rel~='icon']")
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link)
    }
    link.href = CustomFavIcon;

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