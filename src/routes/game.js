const express = require('express');
const authUtils = require("../utils/auth")
const { authenticate } = authUtils
const Router = express.Router();
const Game = require("../models/game");
const Word = require("../models/word");
const Try = require("../models/try");

const compareWords = (word, userWord) => {
    let response = '';

    for (let i = 0; i < word.length; i++) {
        if (word[i] === userWord[i]) {
            response += '1';
        } else if (word.includes(userWord[i])) {
            response += '0';
        } else {
            response += 'x';
        }
    }

    return response;
};

Router.post('/', authenticate, async (req, resp) => {
    try {
        const word = await Word.aggregate([{
            $sample: { size: 1 }
        }]);

        let gameObject = new Game({
            word: word[0]._id,
            tries: [],
            user: req.user._id
        });

        await gameObject.save();
        gameObject = await Game.findOne({
            _id: gameObject._id
        }).populate('user').populate('word')

        return resp.status(200).json({
            "msg": gameObject
        });

    } catch (error) {
        return resp.status(500).json({
            "error": error.message
        });
    }
});
Router.get('/:id', authenticate, async (request, resp) => {
    try {
        const id = request.params.id;
        const gameObject = await Game.findOne({ _id: id }).populate("word");
     
        return resp.status(200).json({
            "data": gameObject,
            "message": "Game Found"

        });

    } catch (error) {
        return resp.status(500).json({
            "error": error.message
        });
    }
}
)
Router.get('/', authenticate, async (request, resp) => {
    try {
        const data = await Game.find().populate("word");
        return resp.status(200).json({
            data,
            "message": "Games Found"
        });
    } catch (error) {
        return resp.status(500).json({
            "error": error.message
        });
    }
})
Router.post('/verify', authenticate, async (req, resp) => {
    try {
        const { word, gameId } = req.body;
        const gameObject = await Game.findOne({ _id: gameId }).populate("word tries");
        if (typeof word === 'undefined') {
            return resp.status(500).json({
                "msg": "You have to send 'word' value"
            });
        }
        
        if (gameObject.word ) {
            let comparisonString = compareWords(gameObject.word.name, word)
            let tryAttempt = Try({
                word,
                result: comparisonString
            })
            tryAttempt = await tryAttempt.save()
            gameObject.tries = [...gameObject.tries, tryAttempt._id];
            await Game.updateOne({ _id: gameId }, { tries: gameObject.tries })
            
            return resp.status(200).json({
                "data": comparisonString,
                "word":word,
                "message": "Here is your result"

            });
        }

        return resp.status(500).json({
            "result": "You don't find the word !"
        });


    } catch (error) {
        return resp.status(500).json({
            "error": error.message
        });
    }
})

module.exports = Router;