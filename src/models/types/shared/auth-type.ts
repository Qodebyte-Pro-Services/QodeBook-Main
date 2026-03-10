type AuthRegisterTypes = {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone: string;
    terms?: boolean;
    is_social_media?: boolean;
};

type AuthOnboardingTypes = {
    business_name: string;
    business_type: string;
    address: string;
    business_phone: string;
    logo_url: string;
}

type AuthOtpTypes = {
    otp: string;
    user_id: string;
    purpose?: string;
}

type ResendOtpTypes = {
    user_id?: string;
    email: string;
    purpose?: string;
}


type AuthSiginTypes = {
    email: string;
    password: string;
}

type AuthForgotPasswordTypes = {
    email: string;
};

type ResetPasswordTypes = {
    newPassword: string;
}

type ResetPasswordResponse = {
    message: string;
}

type GoogleSignupResponse = {
    message: string;
    token: string;
};

type AuthResponse = {
    message: string;
    user_id: string;
    user_email: string;
};

type AuthOnboardingResponse = {
    message: string;
    business: AuthOnboardingTypes & {
        id: number;
        user_id: number;
        created_at: string;
    }
};

type AuthOtpResponse = {
    message: string;
    token: string;
}

type AuthSignInResponse = {
    message: string;
    user_id: number;
    user_email: string;
}

type AuthStaffLoginResponse = {
    message: string;
    requiresOtp: boolean;
    token: string;
    staff: {
        staff_id: string;
        full_name: string;
        email: string;
        role: string;
        permissions: Array<string>;
        business_id: number;
        branch_id: number;
    }
}

type AuthForgotPasswordResponse = {
    message: string;
    user_email?: string;
    user_id?: number | string;
}

type AxiosErrorResponse = {
    response?: {
        data?: {
            message?: string;
        };
        status?: number;
    };
    message: string;
}

export {type AuthRegisterTypes, type GoogleSignupResponse, type AuthResponse, type AxiosErrorResponse, type AuthOtpTypes, type AuthOtpResponse, type ResendOtpTypes, type AuthOnboardingTypes, type AuthSiginTypes, type AuthSignInResponse, type AuthForgotPasswordTypes, type AuthForgotPasswordResponse, type ResetPasswordTypes, type ResetPasswordResponse, type AuthOnboardingResponse, type AuthStaffLoginResponse};