import React from 'react'
import { NavLink } from "react-router";
import { bottomNavItems } from "../data/navItems";

const Bottombar = () => {
    const [activeId, setActiveId] = React.useState(bottomNavItems[0]?.id || null)
    const handleNavItem = (id) => {
        setActiveId(id)
    }

  return (
    <div className="nav-bottombar">
        <div className="nav-bottom-items">
            {bottomNavItems?.length > 0
            && bottomNavItems?.map(item => (
                <NavLink
                    key={item.id}
                    to={item.url}
                    className={`nav-bottom-item ${activeId === item.id ? "active" : ""}`}
                    onClick={() => handleNavItem(item.id)}
                    title={item.label}
                >
                    <div className="nav-bottom-item-icon">
                        <item.icon />
                    </div>
                    <div className="nav-bottom-item-label">{item.label}</div>
                </NavLink>
            ))}
        </div>
    </div>
  )
}

export default React.memo(Bottombar)