'use client';

import {driver} from 'driver.js';
import 'driver.js/dist/driver.css';

interface Steps {
    element: string;
    popover: {
        title: string;
        description: string;
        side: "top" | "bottom" | "left" | "right";
        align: "start" | "center" | "end";
    }
}

const useDriverHandler = ({steps}: {steps: Steps[]}) => {
    const driverObj = driver({
        showProgress: true,
        allowClose: false,
        nextBtnText: "Next",
        prevBtnText: "Previous",
        animate: true,
        steps
    })

    return {
        driverObj
    }
}

export {
    useDriverHandler
}