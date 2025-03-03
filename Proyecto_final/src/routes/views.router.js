import { Router } from "express";

const router = Router();

router.get("/viewLogin", (req, res) => res.render("templates/login", {url_css: "", url_js: "/js/login.js"}));
router.get("/viewRegister", (req, res) =>
  res.render("templates/register", {url_css: "", url_js: "/js/register.js"})
);

export default router;
