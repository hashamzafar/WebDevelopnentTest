export const unathorizedHandler = (err, req, res, next) => {
    if (err.status === 401) {
        res.status(401).send({ status: "error", message: err.message || " your are not logged in!" })
    } else {
        next(err)
    }
}
export const forbiddenHandler = (err, req, res, next) => {
    if (err.status === 403) {
        res.status(403).send({ status: "error", message: err.message || " your are not allowed to do that!" })
    } else {
        next(err)
    }
}



export const notFoundErrorHandler = (err, req, res, next) => {
    if (err.status === 404) {
        res.status(404).send(err.message || "Error not found!")
    } else {
        next(err)
    }
}

export const badRequestErrorHandler = (err, req, res, next) => {
    if (err.status === 400 || err.name === "ValidationError") {
        res.status(400).send(err.errors)
    } else {
        next(err)
    }
}

export const catchAllErrorHandler = (err, req, res, next) => {
    console.log(err)
    res.status(500).send("Generic Server Error")
}