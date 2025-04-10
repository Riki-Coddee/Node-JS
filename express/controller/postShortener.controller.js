import { fileURLToPath } from 'url';
import { loadlinks, saveLinks } from "../model/shortener.model.js";
import path from 'path';
import { readFile} from 'fs/promises';
import crypto from 'crypto';
import { getLinkByShortCode } from '../model/shortener.model.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');


export const redirectToShortLink = async (req, res) => {
  try {
    const { shortCode } = req.params;
    // MongoDb
        const link = await getLinkByShortCode(shortCode);
        if (!link) {
            return res.status(404).send("Short URL not found.");
          }
    // const links = await loadlinks();
    // if (!links[shortCode]) {
    //   return res.status(404).send("Short URL not found.");
    // }
    
      
    return res.redirect(link.url);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Occurred.");
  }
};

 export const getURLShortener =async (req, res) => {
  try {
      const links = await loadlinks();
      // File HANDLING
          // const file = await readFile(path.join(__dirname, "views", "urlShortener.html"));
          // const content = file.toString().replaceAll("{{shorten_url}}",
          //   Object.entries(links)
          //     .map(([shortCode, url]) =>
          //       `<li><a href="/${shortCode}" target="_blank">${req.headers.host}/${shortCode}</a> - ${url}</li>`
          //     )
          //     .join("")
          // );
          // return res.send(content); 

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
      if (!link) {
          return res.status(404).send("Short Code already exists. Please choose another");
        }
      //File Handling
          // const links = await loadlinks();
          // if (links[finalShortCode]) {
          //   return res.status(400).send("Short Code already exists. Please choose another");
          // }
          // links[finalShortCode] = url;
          // await saveLinks(links);

      await saveLinks({url, shortCode: finalShortCode});
      return res.redirect("/");
    } catch (error) {
      console.error(error);
      return res.status(500).send("Internal Server Occurred.");
    }
  }