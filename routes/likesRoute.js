const express = require("express");
const { Posts, Users, Likes } = require("../models");
const CustomError = require("../middlewares/errorhandler.js")
const authmiddleware = require("../middlewares/auth-middleware.js")
const router = express.Router();

//게시글 좋아요 API
router.post("/:postId", authmiddleware, async (req, res, next) => {
    const { postId } = req.params;
    const { userId } = res.locals.user;
    try {
        const existsLikes = await Likes.findOne({ where: { postId, userId } });
        const existsPosts = await Posts.findOne({ where: { postId } });
        //게시글이 없을 때
        if (existsPosts === null ) {
            throw new CustomError("게시글이 존재하지 않습니다", 404)
        }
        if (existsLikes) {
            const likes = existsPosts.likes -1
            await Likes.destroy({
                where: { postId, userId }
            });
            await Posts.update(
                { likes },
                { where: { postId } }
            )
            return res.status(200).json({ message: "게시글의 좋아요를 취소하였습니다." })
        } else {
            const likes = existsPosts.likes +1
            await Likes.create({
                UserId: userId,
                PostId: postId,
            })
            await Posts.update(
                { likes },
                { where: { postId } }
            )
            return res.status(200).json({ message: "게시글의 좋아요를 등록하였습니다." })
        }
    } catch (err) {
        next(err)
    }

})

//좋아요 게시글 조회 API
router.get("/", authmiddleware, async (req, res, next) => {
    const { userId } = res.locals.user;
    try {
        const likes = await Likes.findAll({
            raw: true,
            attributes: ['Post.postId', 'User.userId','User.nickname','Post.title','Post.likes','createdAt', 'updatedAt'],
            where: { UserId: userId },
            order: [['createdAt', 'DESC']],
            include: [{
                model: Users,
                attributes: []
            }, {
                model: Posts,
                attributes: [],
            }]
        })
        res.json({ posts: likes });
    } catch (err) {
        next(err)
    }
})


module.exports = router;