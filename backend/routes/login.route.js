import express from "express";
//import statement for CRUD from controller

const router = express.Router();

router.post("/", createLogin) //C
router.get("/", getLogin) //R
router.put("/", updateLogin)//U
router.delete("/", deleteLogin)//D

export default router;
