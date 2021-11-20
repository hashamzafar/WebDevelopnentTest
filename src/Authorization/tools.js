import jwt from "jsonwebtoken";
import HostModel from "../schemas/hostSchema.js";

export const JWTAuthenticate = async (user) => {
    const accessToken = await generateJWT({ _id: user._id });
    const refreshToken = await generateRefreshJWT({ _id: user._id });

    user.refreshToken = refreshToken;
    await user.save();
    return { accessToken, refreshToken };
};

export const generateJWT = (payload) =>
    new Promise((resolve, reject) =>
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: "30 min" },
            (err, token) => {
                if (err) reject(err);
                resolve(token);
            }
        )
    );

export const verifyJWT = (token) =>
    new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
            if (err) reject(err);
            resolve(decodedToken);
        });
    });

export const generateRefreshJWT = (payload) =>
    new Promise((resolve, reject) =>
        jwt.sign(
            payload,
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "1 week" },
            (err, token) => {
                if (err) reject(err);
                resolve(token);
            }
        )
    );

export const verifyRefreshJWT = (token) =>
    new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, decodedToken) => {
            if (err) reject(err);
            resolve(decodedToken);
        });
    });

export const verifyRefreshAndGenerateTokens = async (actualRefreshToken) => {

    const decodedRefreshToken = await verifyRefreshJWT(actualRefreshToken);


    const user = await HostModel.findById(decodedRefreshToken._id);

    if (!user) throw createHttpError(404, "User not found");


    if (user.refreshToken && user.refreshToken === actualRefreshToken) {


        const { accessToken, refreshToken } = await JWTAuthenticate(user);


        return { accessToken, refreshToken };
    } else throw createHttpError(401, "Refresh token not valid!");
};