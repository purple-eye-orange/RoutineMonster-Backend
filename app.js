import express from "express";
import session from "express-session";
import cors from "cors";

import { usersRouter } from "./routes/users.router.js";
import { routineRouter } from "./routes/routine.router.js";
import { dateRouter } from "./routes/date.router.js";

const PORT = process.env.PORT || 3000;
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  })
);
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  res.sendStatus(204); // No Content
}); // 모든 경로에 대해 OPTIONS 메서드를 처리

app.use(
  session({
    secret: process.env.SESSION_SECRET, // 보안을 위한 비밀 키
    resave: false, // 세션이 수정되지 않은 경우에도 세션 저장소에 다시 저장할지 여부
    saveUninitialized: false, // 초기화되지 않은 세션을 저장할지 여부
    cookie: {
      httpOnly: true, // 자바스크립트 접근 방지
      secure: false, // HTTPS에서만 작동
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1일 동안 유효
    },
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Routine Monster API");
});

app.use("/api/users", usersRouter);
app.use("/api/routine", routineRouter);
app.use("/api/date", dateRouter);

app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});
