import mongoose from "mongoose";

const { Schema, model } = mongoose;

const HostSchema = new Schema({

    first_name: {
        type: String,
        required: true,
    },
    last_name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: [true, "Such email already exists"],
    },
    nickname: {
        type: String,
        required: true,
    },

    picture: {
        type: String,
        default:
            "https://www.pngfind.com/pngs/m/676-6764065_default-profile-picture-transparent-hd-png-download.png",
    },
    googleId: { type: String },
    refreshToken: { type: String },

},
    { timestamps: true },
);

HostSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();
    delete userObject.createdAt;
    delete userObject.updatedAt;
    delete userObject.__v;
    delete userObject.refreshToken;

    return userObject;
};

HostSchema.statics.checkCredentials = async function (email) {
    const user = await this.findOne({ email });

    if (user) {
        const isMatch = email === user.email
        if (isMatch)
            return user;
    } else return null;

};


export default model("host", HostSchema);
