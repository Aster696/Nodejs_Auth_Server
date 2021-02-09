const joi = require('@hapi/joi');

const UserSchema = joi.object({
    email: joi.string().email().lowercase().required(),
    password: joi.string().min(2).required()
});

module.exports = {
    UserSchema
}