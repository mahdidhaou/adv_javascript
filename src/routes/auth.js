const express = require('express');
const bcrypt = require('bcrypt');

const Router = express.Router();
const saltRounds = 10;

const UserModel = require('../models/user');
const Session = require('../models/session');
const user = require('../models/user');
const authUtil = require("../utils/auth")

// const { generateAccessToken, generateRefreshToken } = require('../tools');

Router.post('/register', async (request, response) => {
    const { email, email_cfg, password, password_cfg, username, active } = request.body;

    const hash = await bcrypt.hash(password, saltRounds);

    const user = new UserModel({
        email,
        password: hash,
        username,
        active
    });

    try {

        await user.save();

        return response.status(200).json({
            "user": user
        });

    } catch (error) {
        return response.status(500).json({
            "error": error.message
        });
    }

});

Router.post('/login', async (request, response) => {
    const { email, password } = request.body;

    try {

        let user = await UserModel.findOne({
            email,
            active: true
        });

        if (user) {
            let verif = await bcrypt.compare(password, user.password);

            if (verif) {
                // request.session.user = user;

                // const accessToken = generateAccessToken(user._id)
                // const refeshToken = generateRefreshToken(user._id)
                const token = await authUtil.generateToken(user._id, email);
                const refreshToken = await authUtil.generateRefreshToken(user._id, email);

                // response.cookie('refreshtoken', refeshToken, {
                //     httpOnly: true,
                //     maxAge: 30*24*60*60*1000
                // });

                try {
                    await Session.create({ userId: user._id, accessToken: token, refreshToken })
                } catch (error) {
                    console.log(error)
                    return res.status(500).json({ message: 'session error' });

                }
                return response.status(200).json({
                    "accessToken": token,
                    "user": user
                });
            }
        }

        return response.status(500).json({
            "error": "User not authenticated !"
        });
    } catch (error) {
        return response.status(500).json({
            "error": error.message
        });
    }

});

Router.get('/me', (request, response) => {
    return response.status(200).json({
        "user": request.session.user
    });
})

Router.get('/refresh-token', async (request, response) => {
    try {
        const rf_token = request.cookies.refreshtoken

        if (!rf_token) return response.status(503).json({ msg: "Not authenticated !" });

        const decoded = jwt.verify(rf_token, `secret`)

        if (!decoded) return response.status(503).json({ msg: "Not authenticated !" })

        const user = await UserModel.findById(decoded.id)

        if (!user) return response.status(503).json({ msg: "Not authenticated !" })

        const token = await authUtil.generateToken(user._id, email);


        return response.status(200).json({
            token,
            user
        })
    } catch (error) {
        return response.status(503).json({ "msg": "Not authenticated !" });
    }
});

module.exports = Router;