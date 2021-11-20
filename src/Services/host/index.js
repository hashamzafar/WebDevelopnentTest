import express from "express"
import createHttpError from "http-errors"
import HostModel from "../../schemas/hostSchema.js"
import {
    JWTAuthenticate,
    verifyJWT,
    verifyRefreshAndGenerateTokens,
} from "../../Authorization/tools.js";
import { JWTAuthMiddleware } from "../../Authorization/token.js";
import { imageUpload } from "../../Tools/multerTools.js"


const hostRouter = express.Router()

//Register
hostRouter.post("/register", async (req, res, next) => {

    try {
        const newUser = new HostModel(req.body);
        const { refreshToken } = await JWTAuthenticate(newUser);
        await newUser.save();
        res.status(200).send(newUser);
        console.log(newUser)
    } catch (error) {
        next(error);
    }
})
hostRouter.get("/register", JWTAuthMiddleware, async (req, res, next) => {
    try {
        // const filters = req.query;
        const { username, email } = req.query;
        if (username || email) {
            const filteredUsers = await UserModel.find({
                $or: [{ username }, { email }],
            });
            if (filteredUsers.length > 0) {
                res.send(filteredUsers);
            } else {
                res.send("User does not exist");
            }
        } else {
            const allUsers = await UserModel.find();
            res.send(allUsers);
        }
    } catch (error) {
        next(error);
    }
});


// userinfo
hostRouter.get("/:id", JWTAuthMiddleware, async (req, res, next) => {
    try {
        const user = await HostModel.findById(req.params.id);
        if (user) res.send(user);
        else
            next(createHttpError(404, `user with id ${req.params.id} is not found`));
    } catch (error) {
        next(error);
    }
});


// Login
hostRouter.post("/loginuser", async (req, res, next) => {
    try {
        const { email } = req.body
        const user = await HostModel.checkCredentials(email)
        if (user) {
            const { accessToken, refreshToken } = await JWTAuthenticate(user)
            res.send({ accessToken, refreshToken })
        } else {
            next(createHttpError(401, "Credentials are not correct please register"))
        }
    } catch (error) {
        next(error)
    }
})
hostRouter.get("/me", JWTAuthMiddleware, async (req, res, next) => {
    try {
        console.log("hello", req)
        res.send(req.user);
        console.log("coming deom me", req.body)
    } catch (error) {
        next(error);
    }
});
// hostRouter.put("/me", JWTAuthMiddleware, async (req, res, next) => {
//     try {
//         // const { email, username } = req.body;
//         const updatedProfile = await UserModel.findByIdAndUpdate(
//             req.user._id,
//             req.body,
//             { new: true }
//         );
//         res.send(updatedProfile);
//     } catch (error) {
//         next(error);
//         console.log("error is here", error);
//     }
// });
// profile image upload
hostRouter.post(
    "/uploadprofile",
    JWTAuthMiddleware,
    imageUpload.single("avatar"),
    async (req, res, next) => {
        try {
            const picturePath = req.file.path;
            const userPicture = await HostModel.findByIdAndUpdate(
                req.user._id,
                { picture: picturePath },
                { new: true }
            );
            res.status(201).send(userPicture);
        } catch (err) {
            next(err);
        }
    }
);
hostRouter.get("/getprofile")


export default hostRouter
