const path = require("path")

require('dotenv').config();
const express = require("express")
const morgan = require("morgan")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const passport = require("passport")
const session = require("express-session")

const ApiError = require("./utils/ApiError")
const userRoutes = require("./routes/user")
const categoriesRoutes = require("./routes/categoryRoute");
const brandsRoutes = require("./routes/brandRoute");
const authRoutes = require("./routes/authRoute")
const productsRoutes = require("./routes/productRoute")
const ordersRoutes = require("./routes/orderRoute");
const { DBConnection } = require('./configs/DB');
require("./configs/passport")(passport)

const app = express()

app.use(session({
    secret: "cat",
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        httpOnly: true,
    },
}))

// passport middleware
app.use(passport.initialize())
app.use(passport.session())

DBConnection()
app.use(
    cors({
        origin: [process.env.CLIENT_URL],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        credentials: true,
    })
);

// Middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan("dev"))
    console.log(`mode : ${process.env.NODE_ENV}`)
}

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../final-ecommerce/dist")));
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "final-ecommerce", "dist", "index.html"));
    })
}

app.use(express.json())
app.use(express.urlencoded())
app.use(cookieParser())
app.use(express.static(path.join(__dirname, "uploads")))
// Mount Routes
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/users', userRoutes)
app.use(`/api/v1/categories`, categoriesRoutes);
app.use(`/api/v1/brands`, brandsRoutes);
app.use(`/api/v1/products`, productsRoutes);
app.use(`/api/v1/orders`, ordersRoutes);


app.all("*", (req, next) => {
    next(new ApiError(`cant't find this route ${req.originalUrl}`), 404)
})
//Global Error Handling Middleware For Express
app.use((err, res, next) => {
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