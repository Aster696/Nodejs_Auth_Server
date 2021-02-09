const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const { token } = require('morgan');
const Client = require('./init_redis');
const { EXPIRE } = require('./init_redis');

module.exports = {
    signAccessToken: (userId) => {
        return new Promise((resolve, reject) => {
            const payload = {
                // name: "aster rebeiro"
            }

            const secret = process.env.AccessTokenSecret;
            const options = {
                expiresIn: '30s',
                issuer: 'Aster.com',
                audience: userId
            }
            jwt.sign(payload, secret, options, (error, token) => {
                if(error){ 
                    // reject(error);
                    console.log(error.message);
                    return reject(createError.InternalServerError());
                }
                return resolve(token);
            });
        });
    },//verify token
    verifyAccessToken: (req, res, next) => {
        if(!req.headers['authorization']) return next(createError.Unauthorized('not authorized'));
        const authHeader = req.headers['authorization'];
        const bearer = authHeader.split(' ');
        const token = bearer[1];

        jwt.verify(token, process.env.AccessTokenSecret, (error, payload) => {
            if(error){
                // if(error.name === 'JsonWebTokenError'){
                //     return next(createError.Unauthorized('not authorized'));
                // }else {
                //     return next(createError.Unauthorized(error.message));
                // }
                const message = error.message === 'JsonWebTokenError' ? 'Unauthorized' : error.message;
                return next(createError.Unauthorized(message));
            }
            req.payload = payload;
            next();
        });
    },// Refresh Token
    signRefreshToken: (userId) => {
        return new Promise((resolve, reject) => {
            const payload = {};
            const secret = process.env.RefreshTokenSecret;
            const options = {
                expiresIn: '1y',
                issuer: 'Aster.com',
                audience: userId
            }
            jwt.sign(payload, secret, options, (error, token) => {
                if(error) {
                    console.log(error.message);
                    reject(createError.InternalServerError());
                    return
                }

                Client.set(userId, token, 'EX', 365 * 24 * 60 * 60, (error, reply) => {
                    if(error){
                        console.log(error.message);
                        reject(createError.InternalServerError());
                        return
                    }
                    return resolve(token);
                });
            });
        });

    },//verify refresh token
    verifyRefreshToken: (refreshToken) => {
        return new Promise((resolve, reject) => {
            jwt.verify(refreshToken, process.env.RefreshTokenSecret, (error, payload) => {
                if(error) return reject(createError.Unauthorized());
                
                const userId = payload.aud;
                Client.get(userId, (error, result) => {
                    if(error){
                        console.log(error.message);
                        reject(createError.InternalServerError());
                        return
                    }
                    if (refreshToken === result) return resolve(userId);
                    
                    reject(createError.Unauthorized());
                });
            });
        });
    }

}