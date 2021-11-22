import passport from "passport"
import GoogleStrategy from "passport-google-oauth20"
import HostModel from "../schemas/hostSchema.js"
import { JWTAuthenticate } from "../Authorization/tools.js"


const googleStrategy = new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_OAUTH_ID,
        clientSecret: process.env.GOOGLE_OAUTH_SECRET,
        callbackURL: `${process.env.API_URL}/webtest/googleRedirect`,
    },
    async (accessToken, refreshToken, googleProfile, passportNext) => {
        try {
            const user = await HostModel.findOne({ googleId: googleProfile.id })

            if (user) {

                const tokens = await JWTAuthenticate(user)
                passportNext(null, { tokens })
            } else {


                const newUser = {
                    name: googleProfile.name.givenName,
                    surname: googleProfile.name.familyName,
                    email: googleProfile.emails[0].value,
                    googleId: googleProfile.id,
                }

                const createdHost = new AuthorModel(newUser)
                const savedHost = await createdUser.save()

                const tokens = await JWTAuthenticate(savedHost)

                passportNext(null, { tokens })
            }
        } catch (error) {
            passportNext(error)
        }
    }
)

passport.serializeUser(function (data, passportNext) {
    passportNext(null, data)
})

export default googleStrategy