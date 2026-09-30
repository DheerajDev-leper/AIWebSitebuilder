import express from "express"
import { getCurrentUser , addCredits} from "../controllers/user.controller.js"
import isAuth from "../middleware/isAuth.js"

const userRouter = express.Router()

userRouter.get("/me",isAuth, getCurrentUser)
userRouter.post("/add-credits", isAuth, addCredits);


export default userRouter