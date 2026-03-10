import { changePasswordApproveRequest, changePasswordRejectRequest, createStaffAuth, resendOtpAuth, staffLogoutAuth, verifyCodeAuth } from "@/api/controllers/post/staff-handler";
import { useMutation } from "@tanstack/react-query";

const useStaffAuth = () => {
    return useMutation({
        mutationFn: createStaffAuth
    });
};

const useResendOtpAuth = () => {
    return useMutation({
        mutationFn: resendOtpAuth
    })
}

const useVerifyOtpAuth = () => {
    return useMutation({
        mutationFn: verifyCodeAuth
    })
}

const useChangePasswordApproveRequest = () => {
    return useMutation({
        mutationFn: changePasswordApproveRequest
    })
}

const useChangePasswordRejectRequest = () => {
    return useMutation({
        mutationFn: changePasswordRejectRequest
    })
}

const useStaffAuthLogout = () => {
    return useMutation({
        mutationFn: staffLogoutAuth
    });
}

export {
    useStaffAuth,
    useResendOtpAuth,
    useVerifyOtpAuth,
    useChangePasswordApproveRequest,
    useChangePasswordRejectRequest,
    useStaffAuthLogout
}