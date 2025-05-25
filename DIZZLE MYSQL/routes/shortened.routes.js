
import {Router} from 'express';
import path from 'path';
import { getURLShortener, redirectToShortLink, postURLShortener, getShortenerEditPage, deleteShortCode } from '../controller/postShortener.controller.js'; 

const router = Router();

router.get('/home', (req, res) => {
  const homePagePath = path.join(import.meta.dirname, '..', 'views', 'urlShortener.ejs');
  res.sendFile(homePagePath);
});

router.get('/',getURLShortener );

router.post("/shorten", postURLShortener);

router.get("/:shortCode", redirectToShortLink);

router.route("/edit/:id").get(getShortenerEditPage);

router.route("/delete/:id").post(deleteShortCode);

export const shortenedRoutes = router;