import React from 'react'
import { Outlet, useLocation } from "react-router";
import Navbar from "./Navbar";
import { AnimatePresence, motion } from "framer-motion";
import { fadeBottom } from "../animations/allVariants";

const Layout = () => {
    const location = useLocation()
  return (
    <Navbar>
        <AnimatePresence
            mode="wait"
            initial={false}
        >
            <motion.div
                key={location.pathname}
                variants={fadeBottom}
                initial="hidden"
                animate="show"
                className="nav-content"
            >
                <Outlet />
            </motion.div>
        </AnimatePresence>
    </Navbar>
  )
}

export default React.memo(Layout)