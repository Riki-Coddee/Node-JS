import { loadlinks, saveLinks, getLinkByShortCode, findShortLinkById, deleteShortCodeById } from "../services/shortener.services.js";
import crypto from "crypto";
import { shortenerSchema } from "../validator/shortener-validator.js";
import { error, log } from "console";
import { z } from "zod";

export const getURLShortener = async (req, res) => {
  try {
    if (!req.user) return res.redirect("/login");
    const links = await loadlinks(req.user.id);
    return res.render("urlShortener", { links, host: req.host, errors: req.flash('errors') });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error.");
  }
};

export const postURLShortener = async (req, res) => {
  try {
    const {data, error} = shortenerSchema.safeParse(req.body);
    if(error){
      const errors = error.errors[0].message;
      req.flash("errors", errors);
      return res.redirect("/");
    }
    const { url, shortCode } = data;
    
    const finalShortCode = shortCode || crypto.randomBytes(4).toString("hex");
    
    const link = await getLinkByShortCode(finalShortCode);
    if (link) {
      // return res.status(400).send("Short Code already exists. Please choose another.");
      req.flash("errors", "Short Code already exists. Please choose another.");
      return res.redirect("/");
    }

    await saveLinks({ url, shortCode: finalShortCode, userId: req.user.id });
    return res.redirect("/");
  } catch (error) {
    console.error("Detailed error:", error);
    return res.status(500).send("Internal Server Error.");
  }
};

export const getShortenerEditPage = async (req, res) => {
  const parsed = z.coerce.number().int().safeParse(req.params.id);
  if (!parsed.success) return res.redirect('/404');

  const id = parsed.data;

  try {
    const shortLink = await findShortLinkById(id);
    if (!shortLink) return res.redirect('/404');

    res.render("edit-shortlink", {
      id: shortLink.id,
      url: shortLink.url,
      shortCode: shortLink.shortCode,
      errors: req.flash('errors'),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error.");
  }
};

// deleteShortCode
export const deleteShortCode = async(req, res)=>{
 try {
  const {data:id, error} = z.coerce.number().int().safeParse(req.params.id);
  if(error) return res.redirect('/404');
  await deleteShortCodeById(id);
  return res.redirect('/');
 } catch (error) {
  console.log(error);  
  return res.status(500).send("Internal Server Error.")
 }
}

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
    return res.status(500).send("Internal Server Error.");
  }
};
