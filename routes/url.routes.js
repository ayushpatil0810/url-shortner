import express from "express";
import { shortenPostRequestBodySchema } from "../validations/request.validation.js";
import { ensureAuthenticated } from "../middlewares/auth.middleware.js";
import { insertInDB } from "../services/url.service.js";
import db from "../db/index.js";
import { urlsTable } from "../models/url.model.js";
import { usersTable } from "../models/user.model.js";
import { eq } from "drizzle-orm";
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
