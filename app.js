const express = require("express");
const cookieParser = require("cookie-parser");
const globalRouter = require("./routes/indexRoute.js");
const app = express();
const PORT = 3017;


app.use(cookieParser())
app.use(express.json());
app.use('/', [globalRouter]);

//에러핸들러..?
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  err.message = err.message || '예상치 못한 에러가 발생하였습니다.'

  console.error(err.stack || err.message)
  res.json({errormessage : err.message});
})

app.listen(PORT, () => {
  console.log(PORT, '포트 번호로 서버가 실행되었습니다.');
})