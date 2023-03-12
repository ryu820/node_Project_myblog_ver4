const express = require('express')
const router = express.Router()

const postsRouter = require('./postRoute.js') 
const usersRouter = require('./userRoute.js') 
const authRouter = require('./authRoute.js') 
const commentsRouter = require('./commentRoute.js') 

router.get("/", (req, res) => {
    res.send("안녕하세요 항해 13기 류현주입니다.");
});

router.use('/posts',[postsRouter,commentsRouter])
router.use('/',[usersRouter,authRouter])


module.exports = router;