// Custom Animation variants
export const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 1 // Delays each child by 1s
        }
    }
};

export const fadeLeft = {
    hidden: { opacity: 0, x: -40 },
    show: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.75,
        }
    },
    exit: {
        opacity: 0,
        x: "-1.5rem",
        transition: {
            duration: 0.3,
            ease: "easeIn"
        }
    }
};

export const fadeRight = {
    hidden: { opacity: 0, x: 40 },
    show: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.75,
        }
    },
    exit: {
        opacity: 0,
        x: "1.5rem",
        transition: {
            duration: 0.3,
            ease: "easeIn"
        }
    }
};

export const fadeTop = {
    hidden: { opacity: 0, y: -25 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
        }
    },
    exit: {
        opacity: 0,
        y: "-1.5rem",
        transition: {
            duration: 0.4,
            ease: "easeIn"
        }
    }
};

export const fadeBottom = {
    hidden: { opacity: 0, y: 25 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
        }
    },
    exit: {
        opacity: 0,
        y: "1.5rem",
        transition: {
            duration: 0.4,
            ease: "easeIn"
        }
    }
};

export const zoomFadeIn = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { 
        opacity: 1, 
        scale: 1,
        transition: {
            duration: 0.5,
        }
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        transition: {
            duration: 0.4,
            ease: "easeIn"
        }
    }
};