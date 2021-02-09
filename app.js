const express = require('express');
const app = express();
const morgan = require('morgan');
const createError = require('http-errors');
const userRoute = require('./Routes/user.route');
const { verifyAccessToken } = require('./Helpers/jwt_helper');

require('dotenv').config();
require('./Helpers/init_mongodb');
require('./Helpers/init_redis');

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Client.set('user', 'bar');

// Client.get('user', (error, value) => {
//     if(error)
//         console.log(error.message);
//     console.log("key value -> "+value);
// });

app.get('/', verifyAccessToken, async (req, res, next) => {
    console.log(req.headers['authorization']);
    res.send('SERVER RUNNING ON PORT => ' + PORT);
});

app.use('/user', userRoute);

app.use(async (req, res, next) => {
    // const error = new Error('NOT FOUND');
    // error.status = 404;
    // next(error);
    next(createError.NotFound('Error Handler'));
});

app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.send({
        error: {
            status: err.status || 500,
            message: err.message
        }
    });
});

const PORT = process.env.PORT || 5700;

app.listen(PORT, () => {
    console.log('Server running on PORT => ' + PORT);
});