
// const privateKey  = fs.readFileSync('../config/private.key', 'utf8');
// const fs   = require('fs');
// const publicKey  = fs.readFileSync('./public.key', 'utf8');
require('dotenv').config()
const User = require("../models/user");
const jwt = require('jsonwebtoken');


const authenticate = async (req, res, next) => {
    try {
        const token = req.header("authorization");

        const decoded = jwt.verify(token, process.env.PUBLIC_KEY);
          const data = await User.findById(decoded.userId);
          req.user = data;
        req.token = token;
        next();
    } catch (error) {
        console.log(error)
        return res.status(401).send({
            status: "Error",
            message: "User not authorized",
        });
    }
}

const generateToken = async (userId, email) => {
    console.log(process.env.PUBLIC_KEY);
    const token = jwt.sign({ userId, email }, process.env.PUBLIC_KEY, { expiresIn: '24h' });

    return token;


}
const generateRefreshToken = async (userId, email) => {
    console.log(process.env.PUBLIC_KEY);
    const token = jwt.sign({ userId, email }, process.env.PUBLIC_KEY, { expiresIn: '30d' });

    return token;


}
module.exports = {
    generateToken,
    authenticate,
    generateRefreshToken
}
