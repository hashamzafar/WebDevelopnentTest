import express from "express"
import listEndpoints from "express-list-endpoints"
import cors from "cors"
import mongoose from "mongoose"
import { badRequestErrorHandler, catchAllErrorHandler, notFoundErrorHandler, unathorizedHandler, forbiddenHandler } from './errorHandlers.js'
import hostRouter from "./Services/host/index.js"

const server = express()
server.use(express.json());
const whiteList = [process.env.DEV]

const corsOpts = {
    origin: function (origin, next) {
        console.log('ORIGIN --> ', origin)
        if (!origin || whiteList.indexOf(origin) !== -1) {
            next(null, true)
        } else {
            next(new Error(`Origin ${origin} not allowed!`))
        }
    }
}


server.use(cors(corsOpts))
server.use(express.json({ limit: '500mb', extended: true }))
//Router
server.use("/host", hostRouter)

// error handler
server.use(unathorizedHandler)
server.use(forbiddenHandler)
server.use(badRequestErrorHandler)
server.use(notFoundErrorHandler)
server.use(catchAllErrorHandler)

const port = process.env.PORT || 3001
mongoose.connect(process.env.MONGO_URL_WEB_DEVELOPMENT_TEST)
mongoose.connection.on("connected", () => {
    console.log("Successfully connected to mongo!")
    server.listen(port, () => {
        console.table(listEndpoints(server))
        console.log('Server is running on port', port)
    })
})
mongoose.connection.on("error", () => {
    console.log('Mongo error', err)
})

