const express = require("express");
const { Posts, Users,Likes } = require("../models");
const CustomError = require("../middlewares/errorhandler.js")
const authmiddleware = require("../middlewares/auth-middleware.js")
const router = express.Router();

// 게시글 목록조회
router.get("/", async (req, res,next) => {
    try {
        const posts = await Posts.findAll({
            raw:true,
            attributes: ['postId', 'UserId',"User.nickname", "title","likes", "createdAt", "updatedAt"],
            order: [['createdAt', 'DESC']],
            include: [{
                model: Users,
                attributes: []
            }]
        })
        // console.log(posts)
        res.json({ posts: posts });
    } catch (err) {
        next(err)
    }

});



//게시글 상세 조회 API
router.get("/:postId", async (req, res,next) => {
    try {
        const { postId } = req.params;
        const posts = await Posts.findOne({
            raw:true,
            attributes: ['postId', 'UserId',"User.nickname", "title", "content","likes","createdAt", "updatedAt"],
            where: { postId },
            include: [{
                model: Users,
                attributes: []
            }],
        })
        res.json({ posts: posts });
    } catch (err) {
        next(err)
    }

});

//게시글작성 API
router.post("/", authmiddleware, async (req, res , next) => {
    try {
        const { userId } = res.locals.user;
        const { title, content } = req.body;

        //body에 title이나 content가 포함되지 않거나 형식이 올바르지 않을 때
        if (!req.body.hasOwnProperty('title') || !req.body.hasOwnProperty('content')) {
            throw new CustomError("데이터 형식이 올바르지 않습니다.", 412)
        } else if (typeof req.body.title !== "string") {
            throw new CustomError("게시글 제목의 형식이 올바르지 않습니다.", 412)
        } else if (typeof req.body.content !== "string") {
            throw new CustomError("게시글 내용의 형식이 올바르지 않습니다.", 412)
        }

        const creatposts = await Posts.create({
            UserId: userId,
            title,
            content,
            likes : 0
        })
        res.json({ message: "게시글작성에 성공하였습니다." });
    } catch (err) {
        next(err)
        // return res.status(err.status || 400).json({ errorMessage: err.expect ? err.message : "게시물 작성이 실패했습니다." });
    }


})

//게시글 수정하기
router.put("/:postId", authmiddleware, async (req, res , next) => {
    try {
        const { postId } = req.params;
        const { userId } = res.locals.user;
        const { title, content } = req.body;
        const existsPosts = await Posts.findOne({
            where: { postId }
        });
        //게시글이 없을 때
        if (existsPosts === null) {
            throw new CustomError("게시글이 존재하지 않습니다", 404)
        }

        //body에 title이나 content가 포함되지 않거나 형식이 올바르지 않을 때
        if (!req.body.hasOwnProperty('title') || !req.body.hasOwnProperty('content')) {
            throw new CustomError("데이터 형식이 올바르지 않습니다.", 412)
        } else if (typeof req.body.title !== "string") {
            throw new CustomError("게시글 제목의 형식이 올바르지 않습니다.", 412)
        } else if (typeof req.body.content !== "string") {
            throw new CustomError("게시글 내용의 형식이 올바르지 않습니다.", 412)
        }
        //수정권한이 없을때
        if (userId !== existsPosts.UserId) {
            throw new CustomError("게시글 수정의 권한이 존재하지 않습니다.", 412)
        }
        //수정 업데이트

        await Posts.update({ title, content },{where: { postId }})
        return res.json({ message: "게시글을 수정하였습니다." })
    } catch (err) {
        next(err)
    }

})

//게시글 삭제하기
router.delete("/:postId", authmiddleware, async (req, res , next) => {
    try {
        const { postId } = req.params;
        const { userId } = res.locals.user;
        const existsPosts = await Posts.findOne({ where : {postId} });
        if (existsPosts === null) {
            throw new CustomError("게시글이 존재하지 않습니다.", 412)
        } else if (userId !== existsPosts.UserId) {
            throw new CustomError("게시글 삭제의 권한이 존재하지 않습니다.", 412)
        }

        await Posts.destroy({
            where: {postId}
        })
        return res.status(200).json({ massage: "게시글을 삭제하였습니다." })

    } catch (err) {
        next(err)
    }

})


module.exports = router;