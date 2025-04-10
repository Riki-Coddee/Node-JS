
import { fileURLToPath } from 'url';
import {Router} from 'express';
import express from 'express';
import path from 'path';
import { getURLShortener, redirectToShortLink, postURLShortener } from '../controller/postShortener.controller.js'; 

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');


router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get('/home', (req, res) => {
  const homePagePath = path.join(__dirname, "public", "index.html");
  res.sendFile(homePagePath);
});

router.get('/',getURLShortener );

router.post("/shorten", postURLShortener);

// EJS
router.get("/report",(req, res)=>{
  const student = [{name : "Rikesh Shrestha",rollno: "21",age : "23" },
    {name : "Sushant Khatri",rollno: "22",age : "24" },
    {name : "Shreeyam Rimal",rollno: "23",age : "25" },
    {name : "Suraj Tamang",rollno: "24",age : "26" },
    {name : "Ruzain",rollno: "25",age : "27" },
  ];
  res.render("report", {student});
})

router.get("/:shortCode", redirectToShortLink);

export const shortenedRoutes = router;