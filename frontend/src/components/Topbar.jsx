import React from 'react'
import { NavLink } from 'react-router';
import companyLogo from "../assets/logos/company-logo.png";
import { topNavItems } from "../data/navItems";
import { useSelector } from "react-redux";

const Topbar = () => {
    const { user } = useSelector(state => state.auth);
    // console.log(user);
    const userAvatar = String(user?.fullName)?.split(" ").map((w, i) => i<2 ? w[0] : "").join("");

  return (
    <div className="nav-topbar">
        <div className="nav-top-wrapper">
            <div className="nav-top-logo">
                <img src={companyLogo} alt="company logo" />
            </div>
            <div className="nav-top-items">
                {topNavItems?.length > 0
                && topNavItems?.map(item => (
                    <NavLink
                        key={item.id}
                        to={item.url}
                        className={({ isActive }) => `nav-top-item ${isActive ? "active" : ""}`}
                        title={item.label}
                    >
                        {item.icon ? <item.icon className="nav-top-icon" /> : ""}
                    </NavLink>
                ))}
                <div className="nav-top-item-avatar">
                    <NavLink to={"/profile"} className="avatar-icon">
                        {userAvatar}
                    </NavLink>
                </div>
            </div>
        </div>
    </div>
  )
}

export default React.memo(Topbar)