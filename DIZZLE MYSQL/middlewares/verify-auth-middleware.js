import { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } from "../config/constants.js";
import {refreshTokens, verifyToken } from "../services/auth.services.js";

// export const verifyAuthentication = (req, res, next)=>{
//     const token = req.cookies.access_token;
//     if(!token){
//         req.user = null;
//         return next();
//     }
//     try{
//         const decodedToken = verifyToken(token);
//         req.user = decodedToken;
//         // console.log("req.user:",req.user);
//     }
//     catch(error){
//         req.user = null;
//     }
//     finally{
//         return next();
//     }
// }
export const verifyAuthentication = async (req, res, next) => {
      const accessToken = req.cookies.access_token;
      const refreshToken = req.cookies.refresh_token;
      req.user = null;
  
      if (!accessToken && !refreshToken) {
        return next();
      }
  
      if (accessToken){
          const decodedToken = verifyToken(accessToken);
          req.user = decodedToken;
          return next();
      }
      if (refreshToken) {
        const { newAccessToken, newRefreshToken, user } = await refreshTokens(refreshToken);
  
        const baseConfig = { httpOnly: true, secure: true };
  
        res.cookie("access_token", newAccessToken, {
          ...baseConfig,
          maxAge: ACCESS_TOKEN_EXPIRY,
        });
  
        res.cookie("refresh_token", newRefreshToken, {
          ...baseConfig,
          maxAge: REFRESH_TOKEN_EXPIRY,
        });
        req.user = user;
        return next();
    }
    return next();
  };
  