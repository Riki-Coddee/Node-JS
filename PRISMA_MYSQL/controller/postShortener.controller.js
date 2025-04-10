
import { loadlinks, saveLinks,  getLinkByShortCode  } from "../services/shortener.services.js";
import crypto from 'crypto';


export const redirectToShortLink = async (req, res) => {
  try {
    const { shortCode } = req.params;
        const link = await getLinkByShortCode(shortCode);
        if (!link) {
            return res.status(404).send("Short URL not found.");
          }      
    return res.redirect(link.url);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Occurred.");
  }
};

 export const getURLShortener =async (req, res) => {
  try {
     const links = await loadlinks();
    return res.render('urlShortener', {links, host: req.host})
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Occurred.");
  }
}

export const postURLShortener = async (req, res) => {
    try {
      const { url, shortCode } = req.body;
      const finalShortCode = shortCode || crypto.randomBytes(4).toString("hex");

      const link = await getLinkByShortCode(shortCode);
      if (link) {
          return res.status(404).send("Short Code already exists. Please choose another");
        }
      await saveLinks({url, shortCode: finalShortCode});
      return res.redirect("/");
    } catch (error) {
      console.error(error);
      return res.status(500).send("Internal Server Occurred.");
    }
  }