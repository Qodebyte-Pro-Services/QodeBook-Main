import { IconType } from "react-icons";

const CustomBuilding: IconType = ({size = "1em", color = "currentColor", ...props}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg" {...props}
        xmlnsXlink="http://www.w3.org/1999/xlink">
        <rect width="24" height="24" fill="url(#pattern0_48_1884)" />
        <defs>
            <pattern id="pattern0_48_1884" patternContentUnits="objectBoundingBox" width="1" height="1">
                <use xlinkHref="#image0_48_1884" transform="scale(0.0104167)" />
            </pattern>
            <image id="image0_48_1884" width="96" height="96" preserveAspectRatio="none"
                xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAACXBIWXMAAAsTAAALEwEAmpwYAAAC8UlEQVR4nO3cvW4TQRDA8emgoIEGQgIlPXka3gUK4DH4FqJBiC4yr0NAIJIQJOjRHxnZEjrFaD9mbnf25tfmZnZ35nxnnzcWCSGEEEIIIYQQQgjBAHAAvALO6M8Z8BLYH7L5wG3gK/37sj5RZDTAG/x4LaMBfuDHuYwGZ2Q0OCOjwRkZDc7IaDLWfnTRe/HNZ4jVDPGLb8DBf5p4a4b4ZTdAKvPMNQ93ogGNRQMaiwY4aQD1N9G4CVc2YHVRETfF/zBD/F+y4AZ0QUaDMzIanJHR4IyMBmdkNDgjo8EZGQ3OyGgqanEMPAAOgWut1+FWQeF/A4+Ay63nPoSC4t9rPeclN+Bh6/kOJ6P4H6eXHeAm8AI4pR/ruTwH9sSDjIXdv6D4n+nXsYsmZCzocBK33rHcu2fSu4zFXJ3E9biVfepUepe6EimMa016V7oQnJBR4YSMCidkVKQr3RMae0mVGlC6HcXfNpbNWfUO+JVRoKKFoFQA7bjcPNrFP8eIGBVAOy43j5rNmW9GjAqgHZebR43FZedfVgXQjsvNowZjUj7eMm7CGJPy8Ur3hPraS4oxmXk8LdGAxnpqQNUnS8kfrws9NaDqpib543XBvPCpBdGOJ90yngXVTiQ3nnTxNrRlA6Rw3Nr5puZRY1WIrdzjd8Wl5qmdb2oeNb3ehKVw3grrTcqjJmEuVZ8sxagA2nG5edRgTMrHi5tw4was4llQ2wY0ZXnVmbUgEg2IBpSIV0BjPTWg1dPQo3gW1PZp6EHhuGN9Jakdj1IBrOabmkeNVSG2co/fFZeap3a+qXnUWBViK/f4XXGpeWrnm5pHjVUhtnKP3xWXmqd2vql51CTMJW7CS3waSjwL0iHlDWjK8qSftSASDYgGlIhXwIIa8NN4LVcc/qP2yZwNeG+8mLuT8dY/iNG7p3M24A7w3XAxjyfj7QGf6Nf6112uz9aATVH2gbdGl6MT4NJkvBvrH8TY/K0X34Ansxc/hBBCCCGEIN79AZlrVzweH6rdAAAAAElFTkSuQmCC" />
        </defs>
    </svg>
)

export default CustomBuilding;