import express from "express"
import createHttpError from "http-errors"
import HostModel from "../../schemas/hostSchema.js"
import {
    JWTAuthenticate,
    verifyJWT,
    verifyRefreshAndGenerateTokens,
} from "../../Authorization/tools.js";
import { JWTAuthMiddleware } from "../../Authorization/token.js";
import passport from "passport"

import multer from "multer";
import cloudinary from "../../Tools/cloudinary.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const cloudinaryStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "web-develop-profile",
    },
});
const parser = multer({ storage: cloudinaryStorage })
const hostRouter = express.Router()
hostRouter.get("/loginuser", JWTAuthMiddleware, async (req, res, next) => {
    try {
        const user = await HostModel.findOne(req.user)
        res.send(user);
    } catch (error) {
        next(error);
    }
});
// get all users
hostRouter.get("/users", async (req, res, next) => {
    try {
        const user = await HostModel.find()

        res.send(user);

    } catch (error) {
        next(error);
    }
});

hostRouter.get("/register", JWTAuthMiddleware, async (req, res, next) => {
    try {

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
//Register
hostRouter.post("/register", async (req, res, next) => {

    try {
        const newUser = new HostModel(req.body);
        const { refreshToken } = await JWTAuthenticate(newUser);
        const { _id } = await newUser.save();
        res.status(200).send(_id);

    } catch (error) {
        next(error);
    }
})
// picture upload on cloudinary

hostRouter.post(
    "/:_id/uploadprofile", parser.single("picture"),
    async (req, res, next) => {
        try {
            if (req.file) {
                const update = { picture: req.file.path }
                await HostModel.findByIdAndUpdate(req.params._id, update, { returnOriginal: true })
                res.status(201).send("picture");
            } else res.status(500).send("no image")


        } catch (err) {
            next(err);
        }
    }
);
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
        const host = await HostModel.checkCredentials(email)
        if (host) {
            const { accessToken, refreshToken } = await JWTAuthenticate(host)
            res.send({ accessToken, refreshToken })
        } else {
            next(createHttpError(401, "Credentials are not correct please register"))
        }
    } catch (error) {
        next(error)
    }
})
// google oauth20
hostRouter.get("/googleLogin", passport.authenticate("google", { scope: ["profile", "email"] }))

hostRouter.get("/googleRedirect", passport.authenticate("google"), async (req, res, next) => {
    try {
        n
        res.redirect(`http://localhost:3000?accessToken=${req.user.tokens.accessToken}&refreshToken=${req.user.tokens.refreshToken}`)
    } catch (error) {
        next(error)
    }
})
// edit request
hostRouter.put(
    "/:_id",
    JWTAuthMiddleware,

    async (req, res, next) => {
        const edit = req.params._id;
        try {

            const updatedHost = await HostModel.findByIdAndUpdate(
                edit,
                { $set: req.body },
                { new: true }
            );
            if (updatedHost) {
                res.status(200).send(updatedHost);
            } else {
                next(createHttpError(404, "Host not found"));
            }
        } catch (error) {
            next(error);
        }
    }
);


export default hostRouter
