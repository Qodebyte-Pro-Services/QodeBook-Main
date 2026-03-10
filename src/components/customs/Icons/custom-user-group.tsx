import { IconType } from "react-icons";

const CustomUserGroup: IconType = ({size="1em", color="currentColor", ...props}) => {
    return(
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg" {...props}
            xmlnsXlink="http://www.w3.org/1999/xlink">
            <rect width="24" height="24" fill="url(#pattern0_102_2102)" />
            <defs>
                <pattern id="pattern0_102_2102" patternContentUnits="objectBoundingBox" width="1" height="1">
                    <use xlinkHref="#image0_102_2102" transform="scale(0.0104167)" />
                </pattern>
                <image id="image0_102_2102" width="96" height="96" preserveAspectRatio="none"
                    xlinkHref="data:image/png;base64,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" />
            </defs>
        </svg>
    );
}

export default CustomUserGroup;