import React from 'react'
import { NavLink } from "react-router";
import { bottomNavItems } from "../data/navItems";
import { useSelector } from 'react-redux';

const Bottombar = () => {
    const [nvItms, setNvItms] = React.useState(bottomNavItems);
    const { user } = useSelector(state => state.auth);
    console.log(user);
    const userRole = user?.role?.code;

    const setNavItems = React.useCallback(() => {
        if (userRole === "tm") {
            const newNavItms = bottomNavItems?.map(itm => ({
                ...itm,
                url: ["/performance"].includes(String(itm.url)) ? `/tm${itm.url}` : itm.url
            }));
            setNvItms(newNavItms);
        }
    }, [])
    React.useEffect(() => {
        setNavItems();
    }, [setNavItems])
    
  return (
    <div className="nav-bottombar">
        <div className="nav-bottom-items">
            {nvItms?.length > 0
            && nvItms?.map(item => (
                <NavLink
                    key={item.id}
                    to={item.url}
                    className={({ isActive }) => `nav-bottom-item ${isActive ? "active" : ""}`}
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