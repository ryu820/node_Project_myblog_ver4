const express = require("express");
const { Users } = require("../models");
const CustomError = require("../middlewares/errorhandler.js")
const router = express.Router();

//회원가입 API
router.post('/signup', async (req, res ,next) => {
    try {
        const { nickname, password, confirm } = req.body;
        const existUser = await Users.findOne({ where: { nickname : nickname } });
        console.log(nickname, password, confirm)
        const nicknameRegex = /^[a-z0-9]{3,}$/
        const passwordRegex = /^[a-z0-9]{4,}$/

        if (!nicknameRegex.test(nickname) || typeof nickname !== "string") {
            throw new CustomError("닉네임의 형식이 일치하지 않습니다.",412);
        } else if (!passwordRegex.test(password)|| typeof password !== "string") {
            throw new CustomError("패스워드 형식이 일치하지 않습니다.",412);
        } else if (password.includes(nickname)) {
            throw new CustomError("패스워드에 닉네임이 포함되어 있습니다.",412);
        }

        if (existUser) {
            throw new CustomError("중복된 닉네임입니다", 412);
        }
        if (password !== confirm) {
            throw new CustomError("패스워드가 일치하지 않습니다", 412);
        }
        const user = await Users.create({ nickname, password });
        return res.status(200).json({ message: "회원가입에 성공하였습니다." })
    } catch (err) {
        next(err)
    }
})


module.exports = router;