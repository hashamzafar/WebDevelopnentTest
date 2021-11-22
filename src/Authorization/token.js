import createHttpError from "http-errors";
import { verifyJWT } from "./tools.js";
import HostModel from "../schemas/hostSchema.js";

export const JWTAuthMiddleware = async (req, res, next) => {
    if (!req.headers.authorization) {
        next(
            createHttpError(
                401,
                " please provide credentials in Authorization header!"
            )
        );
    } else {
        try {
            const token = req.headers.authorization.replace("Bearer ", "");
            const decodedToken = await verifyJWT(token);
            const user = await HostModel.findById(decodedToken._id);

            if (user) {
                req.user = user;
                next();
            } else {
                next(createHttpError(404, "user not found"));
            }
        } catch (error) {

            next(createHttpError(401, "token not valid"));
        }
    }
};