import React from 'react'
import { Outlet, useLocation } from "react-router";
import Navbar from "./Navbar";
import { AnimatePresence, motion } from "framer-motion";
import { fadeBottom } from "../animations/allVariants";
import { div } from 'framer-motion/client';

const Layout = () => {
    const location = useLocation()
  return (
    <div className="app-layout">
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
                    style={{ width: "100%", height: "100%" }}
                >
                    <Outlet />
                </motion.div>
            </AnimatePresence>
        </Navbar>
    </div>
  )
}

export default React.memo(Layout)