import {Router} from 'express';
import * as authControllers from '../controller/auth.controller.js';
import multer from 'multer';
import path from "path";

const router = Router();

router.route('/register')
        .get(authControllers.getRegisterPage)
        .post(authControllers.postRegister);


router.route('/login')
        .get(authControllers.getLoginPage)
        .post(authControllers.postLogin);

router.get('/me', authControllers.getMe);

router.route('/profile').get(authControllers.getProfilePage);

const avatarStorage = multer.diskStorage({
        destination: (req, file, cb)=>{
                cb(null, "public/uploads/avatars");
        },
        filename: (req, file, cb)=>{
                const ext = path.extname(file.originalname);
                cb(null, `${Date.now()}_${Math.random()}${ext}`);
        }
});

const avatarFileFilter = (req, file, cb)=>{
        if(file.mimetype.startsWith("image/")){
                return cb(null, true);
        }
        else{
          return cb(new Error("Only image files are allowed."), false);
        }
}

const avatarUpload = multer({
        storage: avatarStorage,
        fileFilter: avatarFileFilter,
        limit: ({fileSize: 5 * 1024 * 1024}),
});

router.route('/edit-profile').get(authControllers.getEditProfilePage).post(avatarUpload.single("avatar"), authControllers.postEditProfilePage);

router.route('/verify-email').get(authControllers.verifyEmail);

router.route('/resend-verification-link').get(authControllers.resendVerificationLink);

router.route('/verify-email-token').get(authControllers.verifyEmailToken);

router.route('/change-password').get(authControllers.getChangePasswordPage).post(authControllers.postChangePasswordPage);

router.route('/forgot-password').get(authControllers.getForgotPasswordPage).post(authControllers.postForgotPasswordPage);

router.route('/reset-password/:token').get(authControllers.getResetPasswordTokenPage).post(authControllers.postResetPasswordTokenPage);

router.route('/google').get(authControllers.getGoogleLoginPage);

router.route('/google/callback').get(authControllers.getGoogleLoginCallBack);

router.route('/github').get(authControllers.getGithubPage);

router.route('/github/callback').get(authControllers.getGithubLoginCallBack);

router.route('/set-password').get(authControllers.getSetPasswordPage).post(authControllers.postSetPasswordPage);

router.route('/logout')
       .get(authControllers.logoutUser);
export const authRoutes = router;