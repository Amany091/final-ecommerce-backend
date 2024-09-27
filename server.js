const path = require("path")

require('dotenv').config()
const express = require("express")
const morgan = require("morgan")
const cookieParser = require("cookie-parser")

const ApiError = require("./utils/ApiError")
const userRoutes = require("./routes/user")
const categoriesRoutes = require("./routes/categories");
const brandsRoutes = require("./routes/brands");
const { DBConnection } = require('./configs/DB')
const app = express()
DBConnection()
// Middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan("dev"))
    console.log(`mode : ${process.env.NODE_ENV}`)
}
app.use(express.json())
app.use(express.urlencoded())
app.use(cookieParser())
app.use(express.static(path.join(__dirname,"uploads")))
// Mount Routes
app.use('/api/v1/users', userRoutes)
app.use(`/api/v1/categories`, categoriesRoutes);
app.use(`/api/v1/brands`, brandsRoutes);


app.all("*", (req, res, next) => {
    next(new ApiError(`cant't find this route ${req.originalUrl}`),404)
})
//Global Error Handling Middleware For Express
app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500
    err.status = err.status || 'Error'
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
    })
    next()
    
})

const port = process.env.PORT || 5000
app.listen(port, () => {
    console.log(`App listen on port ${port}`);
})