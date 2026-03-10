import { IconType } from "react-icons";

const CustomNaira: IconType = ({size = "1em", color = "currentColor", ...props}) => {
    return(
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg" {...props}
            xmlnsXlink="http://www.w3.org/1999/xlink">
            <rect width="24" height="24" fill="url(#pattern0_95_378)" />
            <defs>
                <pattern id="pattern0_95_378" patternContentUnits="objectBoundingBox" width="1" height="1">
                    <use xlinkHref="#image0_95_378" transform="scale(0.0208333)" />
                </pattern>
                <image id="image0_95_378" width="48" height="48" preserveAspectRatio="none"
                    xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAADgklEQVR4nO2ZTUsWURTHf+qTIQVmmpC6qi8QZSm0L0LbiESbtIWfIBemUm4qJYgSjTZJkrXqhagPkGJQ26SV2qIXUivdRJpujAtn4HCZmTt3nvHR4vnDxXHm/M85d+be83IfKKKIIrJAKdAM9AHPgA/ACrAhY0XuPQV6gSbhbDsagEHgK7DpOb4AN4D67XC8GrgHrKdw3B5/gLvA/kI5fx74GeLIN+A+cAE4KpPcJaMGOAZ0AGPAQgj/B3BuKx3PyVu3Db8GWoAyT12twGSIvlF5nikqgFeWoVngVAa6zwBzlu6XYjMT5EKcHwf2ZGUA2As8DJlEJl/CXjZX2DpctWyNZLFhC+V81CTaSYlqK9qYZVMoTCi734GqfJfObMyavwX8Bm566DactRiO2RPz+SylBitJnY6R1XJdCfUHnHVHdNLJrs5nAoNWnI+DXq+rwJEE+jUnDlNK7joJUWbVNiZJxcFORCamV3pw4tCq5D4lLQCbrfLAFYvD6pvnQElCThyM7UUle4IE6FMEU9u4EFWkXUrIceGBku1xSks9HxBMYeaCduaOujZ9wMkEHBc6lewTp7Q0HgHBVJUuaGdM5flW/W/2Uq2D40Kjkp1xSgPLimCSWRgOA93ySbUzPVJN6ntv5L4eNqcbOBRh64BVcjuh43p5hIxOMlmN+Qhbu6188P9PYDnBEjKfux8YspwYssY76/mjCE5/lktIb2LTBroQtyFrraT4Vja6zyY+7ruJdRjtyHMCSCjdiAi1mwn0X/QNo72KMJbBBJCkFrX2XRi3IpYTTYqw4FlKRKFEygvfCeSAJSVrcoITpXLolKaYi0NlSPO+6eCcTVPMISdmAXEyowkgpfaqB2dayV3DA/UScwOyaS6isCYy5m8SdCm9GzFyLUpuzbehQY77AgVz0uaFwTQav3waDuC2JMyhiOfG1kdlf5gUqJbEESgx5zaFwmNldyltU4+cVer1ao48thoDls22fBWOFnASA5Ytk/TyRk6O+bTiiZg9kQZ7rWVjxgvPA+NYVIRMYt4RnZKixdqwgfOZHe7qLzESkoim5PTA5yA2J0lqOkTfcJZvPgztVnoPxqI04J2S8muknyiX60YpzMZj+G0UCFXyNXSySzvW5K3vYxtQJwnscwrHTW1jyoOD7ACUyqHTZanZZ6SzW5dhrt/Lsx5pUnbEz6xFFME/jr9v9CEWou2RywAAAABJRU5ErkJggg==" />
            </defs>
        </svg>
    );
}

export default CustomNaira;