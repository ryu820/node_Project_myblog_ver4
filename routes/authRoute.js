const express = require("express");
const { Users } = require("../models");
const CunstomError = require("../middlewares/errorhandler.js")
const jwt = require("jsonwebtoken");
const router = express.Router();

//로그인 API
router.post("/login", async (req, res ,next) => {
    try {
        const { nickname, password } = req.body;
        const user = await Users.findOne({ where : {nickname: nickname} });
        console.log(user)

        if (!user || password !== user.password) {
            throw new CunstomError("닉네임 또는 패스워드를 확인해주세요",412)
        }
        
        const token = jwt.sign({ nickname: user.nickname }, "This-is-Scret-Key");
        res.cookie("authorization", `Bearer ${token}`);
        res.status(200).json({ token })
    } catch (err) {
        next(err)
    }

})


module.exports = router;