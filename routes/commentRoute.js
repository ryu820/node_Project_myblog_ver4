const express = require("express");
const { Posts, Users, Comments } = require("../models");
const CustomError = require("../middlewares/errorhandler.js")
const authmiddleware = require("../middlewares/auth-middleware.js")
const router = express.Router();

//댓글 작성 API
router.post("/:postId/comments", authmiddleware, async (req, res, next) => {
    try {
        const { comment } = req.body;
        const { userId } = res.locals.user;
        const { postId } = req.params;
        const existsPosts = await Posts.findOne({ where: { postId } });
        const maxCommentId = await Comments.findOne(
            {
                where: { postId },
                order: [['createdAt', 'DESC']]
            })
        console.log(maxCommentId)
        const commentId = maxCommentId ? maxCommentId.commentId + 1 : 1;
        //게시글이 없을 때
        if (existsPosts === null) {
            throw new CustomError("게시글이 존재하지 않습니다", 404)
        }
        //body 형식이 올바르지 않을 때
        if (typeof req.body.comment !== "string") {
            throw new CustomError("데이터 형식이 올바르지 않습니다.", 412)
        } else if (!req.body.hasOwnProperty('comment')) {
            return res.status(200).json({ message: "댓글내용을 입력해주세요" })
        }
        await Comments.create({
            commentId: commentId,
            UserId: userId,
            PostId: postId,
            comment
        })
        res.status(200).json({ message: "댓글을 작성하였습니다." })
    } catch (err) {
        next(err)
    }
})

//댓글 조회 API
router.get("/:postId/comments", async (req, res, next) => {
    const { postId } = req.params;
    try {
        const existsPosts = await Posts.findOne({
            where: { postId }
        });
        //게시글이 없을 때
        if (existsPosts === null) {
            throw new CustomError("게시글이 존재하지 않습니다", 404)
        }
        const comments = await Comments.findAll({
            raw: true,
            attributes: ['commentId', 'userId', 'User.nickname', 'comment', 'createdAt', 'updatedAt'],
            where: { PostId: postId },
            order: [['createdAt', 'DESC']],
            include: [{
                model: Users,
                attributes: []
            }]
        })
        // console.log(comments)
        res.status(200).json({ comments: comments });
    } catch (err) {
        next(err);
    }

});

//댓글 수정 API
router.put("/:postId/comments/:commentId", authmiddleware, async (req, res, next) => {
    const { postId, commentId } = req.params;
    const { userId } = res.locals.user;
    const { comment } = req.body;
    try {
        const existsPosts = await Posts.findOne({ where: { postId } });
        const existsComments = await Comments.findOne({ where: { postId, commentId } });

        //게시글이 없을 때
        if (existsPosts === null) {
            throw new CunstomError("게시글이 존재하지 않습니다", 404)
        }
        //수정권한이 없을때
        if (userId !== existsComments.UserId) {
            throw new CustomError("댓글 수정의 권한이 존재하지 않습니다.", 412)
        }

        await Comments.update(
            { comment },
            { where: { postId, commentId } }
        )
        res.status(200).json({ message: "댓글을 수정하였습니다." })
    } catch (err) {
        next(err)
    }

})

//댓글 삭제 API
router.delete("/:postId/comments/:commentId", authmiddleware, async (req, res, next) => {
    const { postId, commentId } = req.params;
    const { userId } = res.locals.user;
    try {
        const existsPosts = await Posts.findOne({ where: { postId } });
        const existsComments = await Comments.findOne({ where: { postId, commentId } });

        //게시글이 없을 때
        if (existsPosts === null) {
            throw new CunstomError("게시글이 존재하지 않습니다", 404)
        }
        //수정권한이 없을때
        if (userId !== existsComments.UserId) {
            throw new CustomError("댓글 삭제의 권한이 존재하지 않습니다.", 412)
        }

        await Comments.destroy({
            where: {postId , commentId}
        })
        res.status(200).json({ message: "댓글을 삭제하였습니다." })
    } catch (err) {
        next(err)
    }
})
module.exports = router;