import mjml2html from "mjml";
import fs from 'fs/promises';
import ejs from 'ejs';
import path from "path";
export const getHtmlFromMjmlTemplate = async(template, data)=>{
const mjmlFile = await fs.readFile(path.join(import.meta.dirname, '..' ,'emails', `${template}.mjml`), 'utf-8');

const filledTemplate = ejs.render(mjmlFile, data);

return mjml2html(filledTemplate).html;
}