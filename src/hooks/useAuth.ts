/* eslint-disable react-hooks/rules-of-hooks */
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { userRegistrationHandler } from "@/api/auth.signup";
import {
    AuthForgotPasswordResponse,
    AuthForgotPasswordTypes,
    AuthOtpResponse,
    AuthOtpTypes,
    AuthRegisterTypes,
    AuthResponse,
    AuthSiginTypes,
    AuthSignInResponse,
    ResetPasswordResponse,
    ResetPasswordTypes,
} from "@/models/types/shared/auth-type";
import { userOtpCodeHandler } from "@/api/auth.verify-otp";
import { userSigninHandler } from "@/api/auth.signin";
import { userForgetPasswordHandler } from "@/api/auth.forget-password";
import { userResetPasswordHandler } from "@/api/auth.reset-password";
import { updateAuthUserProfile } from "@/api/controllers/put/handlers";
import { userLogoutAuth } from "@/api/auth.logout";

export const useRegister = (): UseMutationResult<
    AuthResponse,
    Error,
    AuthRegisterTypes
> => {
    return useMutation({
        mutationFn: userRegistrationHandler,
    });
};

export const userVerification = (): UseMutationResult<
    AuthOtpResponse,
    Error,
    AuthOtpTypes,
    unknown
> => {
  return useMutation({
    mutationFn: userOtpCodeHandler
  });
};

export const userSigninController = (): UseMutationResult<AuthSignInResponse, Error, AuthSiginTypes, unknown> => {
    return useMutation({
        mutationFn: userSigninHandler
    })
}

export const userForgetPasswordController = (): UseMutationResult<AuthForgotPasswordResponse, Error, AuthForgotPasswordTypes, unknown> => {
    return useMutation({
        mutationFn: userForgetPasswordHandler
    })
}

export const userResetpasswordController = (): UseMutationResult<ResetPasswordResponse, Error, ResetPasswordTypes, unknown> => {
    return useMutation({
        mutationFn: userResetPasswordHandler
    })
}

export const useUpdateAuthUserProfile = () => useMutation({
    mutationFn: updateAuthUserProfile
});


export const useUserLogoutAuth = () => useMutation({
    mutationFn: userLogoutAuth
});