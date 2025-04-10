import express from 'express';
import 'dotenv/config';
import { env } from './config/env.js';
import path from 'path';
import { shortenedRoutes } from './routes/shortener.routes.js';

const app = express();

app.use(shortenedRoutes);
app.set("view engine", "ejs");
app.set("views", "./view");
app.use((req, res) => {
  return res.status(404).sendFile(path.join(import.meta.dirname, "src", "404.html"));
});

app.listen(env.PORT, () => {
  console.log(`Server is running at PORT:${env.PORT}`);
});
