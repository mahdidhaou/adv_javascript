const express = require('express');
const Router = express.Router();
const authUtils = require("../utils/auth")
const User = require('../models/user');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const { authenticate } = authUtils

const userExist = async (condition) => {
    try {
        const userExist = await User.findOne(condition);
        return userExist;
    } catch (error) {
        return false
    }
}

Router.post("/", async (request, response) => {
    try {
        const { email, email_cfg, password, password_cfg, username } = request.body;

        const hash = await bcrypt.hash(password, saltRounds);

        if (await userExist({ email })) {
            return response.status(400).json({
                "message": "User Of Same Email Exists",

            });
        }

        const user = new User({
            email,
            password: hash,
            username,
            active: true
        });

        await user.save();
        return response.status(200).json({
            "user": user,
            "message": "Users Created"

        });

    } catch (error) {
        return response.status(500).json({
            "error": error.message
        });
    }
})
Router.get("/:id", authenticate, async (request, response) => {
    try {
        const id = request.params.id;
        const userObject = await User.findOne({ _id: id });

        if (!userObject) {
            return response.status(200).json({
                "userObject": undefined,
                "message": "User Does Not Exist"

            });
        }
        return response.status(200).json({
            "userObject": userObject,
            "message": "Users Created"

        });

    } catch (error) {
        return response.status(500).json({
            "error": error.message
        });
    }
})
Router.put("/", authenticate, async (request, response) => {
    try {
        const { _id, email, username } = request.body;
       

        await User.updateOne({ _id }, { email, username });

        return response.status(200).json({
            "data": _id,
            "message": "User Updated"

        });


    } catch (error) {
        return response.status(500).json({
            "error": error.message
        });
    }
})
Router.get("/", authenticate, async (request, response) => {
    try {
        const userList = await User.find();
        return response.status(200).json({
            "data": userList,
            "message": "Users List"
        });
    } catch (error) {
        return response.status(500).json({
            "error": error.message
        });
    }
})

module.exports = Router;