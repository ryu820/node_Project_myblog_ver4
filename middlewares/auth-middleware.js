const jwt = require("jsonwebtoken")
const { Users } = require("../models");
const CunstomError = require("../middlewares/errorhandler.js")

module.exports = async (req, res, next) => {
    try {
        const { authorization } = req.cookies;
        const [authType, authToken] = (authorization ?? "").split(" ")
        // console.log(authType,":", authToken)

        if (authType !== "Bearer" || !authToken) {
            throw new CunstomError("로그인이 필요한 기능입니다",403)
        }
        const { nickname } = jwt.verify(authToken, "This-is-Scret-Key")
        const user = await Users.findOne({ where : {nickname : nickname }})
        res.locals.user = user;
        next();

    } catch (err) {
        return res.status(err.status || 500).json({
            errorMessage: err.expect ?
                err.message : "전달된 쿠키에서 오류가 발생하였습니다."
        });
    }

}

