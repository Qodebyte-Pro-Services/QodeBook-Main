import { DefaultType } from "@/models/types/shared/project-type";

const AuthScroller = ({children}: DefaultType) => {
    return(
        <div className="w-full h-full lg:h-fit">
            {children}
        </div>
    );
}

export default AuthScroller;