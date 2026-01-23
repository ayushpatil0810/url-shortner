import express from "express";
import { shortenPostRequestBodySchema } from "../validations/request.validation.js";
import { ensureAuthenticated } from "../middlewares/auth.middleware.js";
import { insertInDB } from "../services/url.service.js";
import db from "../db/index.js";
import { urlsTable } from "../models/url.model.js";
import { and, eq } from "drizzle-orm";

const router = express.Router();

router.post("/shorten", ensureAuthenticated, async (req, res) => {
  const validationResult = await shortenPostRequestBodySchema.safeParseAsync(
    req.body,
  );

  if (validationResult.error) {
    return res.status(400).json({ error: validationResult.error });
  }

  const result = await insertInDB({
    ...validationResult.data,
    userId: req.user.id,
  });

  return res.status(201).json({
    id: result.id,
    shortCode: result.shortCode,
    targetURL: result.targetURL,
  });
});

router.get("/codes", ensureAuthenticated, async (req, res) => {
  const codes = await db
    .select()
    .from(urlsTable)
    .where(eq(urlsTable.userId, req.user.id));

  return res.json({ codes });
});

router.delete("/:id", ensureAuthenticated, async (req, res) => {
  const id = req.params.id;
  await db
    .delete(urlsTable)
    .where(and(eq(urlsTable.id, id), eq(urlsTable.userId, req.user.id)));

  return res.status(200).json({ deleted: true });
});

router.patch("/:id", ensureAuthenticated, async (req, res) => {
  const { shortCode, targetURL } = req.body;

  const id = req.params.id;
  await db
    .update(urlsTable)
    .set({ shortCode, targetURL })
    .where(and(eq(urlsTable.id, id), eq(urlsTable.userId, req.user.id)));

  return res.status(200).json({ updated: true });
});

router.get("/:shortCode", async (req, res) => {
  const code = req.params.shortCode;

  const [result] = await db
    .select({
      targetURL: urlsTable.targetURL,
    })
    .from(urlsTable)
    .where(eq(urlsTable.shortCode, code));

  if (!result) {
    return res.status(404).json({ error: "Invalid URL" });
  }

  return res.redirect(result.targetURL);
});

export default router;
