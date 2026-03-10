import React, { ButtonHTMLAttributes, ReactNode } from "react";

type AuthButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    children: ReactNode;
    className: string;
    id: string;
    handleUserClick?: () => void;
};

const AuthButton = ({ children, handleUserClick, ...props }: AuthButtonProps) => {
    return (
        <button {...props} onClick={handleUserClick}>
            {children}
        </button>
    );
};

export default AuthButton;