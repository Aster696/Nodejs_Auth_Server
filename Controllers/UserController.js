const createError = require('http-errors');
const User = require('../Models/User.model');
const { UserSchema } = require('../Helpers/validation_schema');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../Helpers/jwt_helper');
const Client = require('../Helpers/init_redis');

module.exports = {

register: async (req, res, next) => {
    // console.log(req.body);
    // res.send('register route');
    try {
        // const {email, password} = req.body;
        // if(!email || !password) throw createError.BadRequest('email or password missing');
        // console.log(result);
        const result = await UserSchema.validateAsync(req.body);

        const doesExist = await User.findOne({email: result.email});
        if(doesExist) throw createError.Conflict('user => ' + result.email + ' already exist');

        const user = new User(result);
        const savedUser = await user.save();
        // const accessToken = await signAccessToken(savedUser.id);
        // const refreshToken = await signRefreshToken(savedUser.id);
        
        // res.send('user data: '+savedUser +'\n'+'token: ' + accessToken);
        res.send('register success');
    } catch (error) {
        if(error.isJoi === true) error.status = 442;
        next(error);
    }
},

login: async (req, res, next) => {
    try {
        const result = await UserSchema.validateAsync(req.body);
        const user = await User.findOne({email: result.email});
        if(!user) throw createError.NotFound('User not found');

        const isMatch = await user.isValidPassword(result.password);
        if(!isMatch) throw createError.Unauthorized('Invalid username / password');

        const accessToken = await signAccessToken(user.id);
        const refreshToken = await signRefreshToken(user.id);

        res.send({ accessToken, refreshToken });

    } catch (error) {
        if(error.isJoi === true) return next(createError.BadRequest('Invalid user name / password'));
        next(error);
    }
},
refreshToken: async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if(!refreshToken) throw createError.BadRequest();
        const userID = await verifyRefreshToken(refreshToken);
        const accessToken = await signAccessToken(userID);
        const refToken = await signRefreshToken(userID);

        res.send({accessToken: accessToken, refreshToken: refToken});
    } catch (error) {
        
    }
},

logout: async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if(!refreshToken) throw createError.BadRequest();
        const userId = await verifyRefreshToken(refreshToken);
        
        Client.del(userId, (err, value) => {
            if(err){
                console.log(err.message);
                throw createError.InternalServerError();
            }
            console.log(value);
            res.sendStatus(204);
        });

    } catch (error) {
        next(error);
    }
}

}