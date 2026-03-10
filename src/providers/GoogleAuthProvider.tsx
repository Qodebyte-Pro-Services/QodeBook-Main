import { DefaultType } from "@/models/types/shared/project-type";
// import { GoogleOAuthProvider } from "@react-oauth/google";

const GoogleAuthProvider = ({ children }: DefaultType) => {
    // return(
    //     <GoogleOAuthProvider clientId={`${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}`}>
    //         {children}
    //     </GoogleOAuthProvider>
    // );
    return children;
}

export default GoogleAuthProvider;