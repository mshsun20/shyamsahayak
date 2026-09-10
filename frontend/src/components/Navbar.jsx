import React from 'react'
import "../styles/navbar.css";
import Topbar from "./Topbar";
import Bottombar from "./Bottombar";

const Navbar = ({ children }) => {
  return (
    <div className="nav-layout">
      <Topbar />
      <div className="nav-container">{children}</div>
      <Bottombar />
    </div>
  )
}

export default React.memo(Navbar)