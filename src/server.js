import express from "express"
import listEndpoints from "express-list-endpoints"
import cors from "cors"
import mongoose from "mongoose"
import { badRequestErrorHandler, catchAllErrorHandler, notFoundErrorHandler, unathorizedHandler, forbiddenHandler } from './errorHandlers.js'
import hostRouter from "./Services/host/index.js"

const server = express()
server.use(express.json());
const whiteList = [process.env.DEV]// COMING FROM ENV FILE

const corsOpts = {
    origin: function (origin, next) {
        console.log('ORIGIN --> ', origin)
        if (!origin || whiteList.indexOf(origin) !== -1) { // if received origin is in the whitelist I'm going to allow that request
            next(null, true)
        } else { // if it is not, I'm going to reject that request
            next(new Error(`Origin ${origin} not allowed!`))
        }
    }
}


server.use(cors(corsOpts))
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

