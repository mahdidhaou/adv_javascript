const express = require('express');
const Router = express.Router();

const authUtils = require("../utils/auth")
const { authenticate } = authUtils
const Word = require('../models/word');
const wordExist = async (condition) => {
    try {
        const userExist = await User.findOne(condition);
        return userExist;
    } catch (error) {
        return false
    }
}
Router.post("/", authenticate, async (request, response) => {
    try {
        const { name } = request.body;


        if (await wordExist({ name })) {
            return response.status(400).json({
                "message": "Word Of Same Name Exists",

            });
        }

        const word = new Word({
            name
        });

        await word.save();
        return response.status(200).json({
            "data": word,
            "message": "Word Created"

        });

    } catch (error) {
        return response.status(500).json({
            "error": error.message
        });
    }
}
);
Router.put("/", authenticate, async (request, response) => {
    try {
        const { _id, name } = request.body;
        if (! await wordExist({ _id })) {
            return response.status(400).json({
                "message": "Word Of Does not Exist",

            });
        }

        await User.updateOne({ _id }, { name });

        return response.status(200).json({
            "data": _id,
            "message": "Word Updated"

        });


    } catch (error) {
        return response.status(500).json({
            "error": error.message
        });
    }
});
Router.get("/:id", authenticate,  async (request, response) => {
    try {
        const id = request.params.id;
        const wordObject = await Word.findOne({ _id: id });

        if (!wordObject) {
            return response.status(200).json({
                "data": undefined,
                "message": "Word Does Not Exist"

            });
        }
        return response.status(200).json({
            "data": wordObject,
            "message": "Word Found"

        });

    } catch (error) {
        return response.status(500).json({
            "error": error.message
        });
    }
});
Router.get("/", authenticate, async (request, response) => {
    try {
        const wordList = await Word.find();
        return response.status(200).json({
            "data": wordList || [],
            "message": "Words Found"
        });
    } catch (error) {
        return response.status(500).json({
            "error": error.message
        });
    }
});
Router.delete("/:id", authenticate, async (req, resp) => {
    try {
        const { id } = req.params;
        console.log(id);
        await Word.deleteOne({ _id: id });
        return resp.status(200).json({
            "data": id,
            "message": "Word deleted"

        });

    } catch (error) {
        return resp.status(500).json({
            "error": error.message
        });
    }
});
module.exports = Router;