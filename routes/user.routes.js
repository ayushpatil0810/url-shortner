import express from "express";
import { db } from "../db/index.js";
import { usersTable } from "../models/user.model.js";
import { randomBytes, createHmac } from "crypto";
import { eq } from "drizzle-orm";
import { signupPostRequestRequestBodySchema } from "../validations/request.validation.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  const validationResult =
    await signupPostRequestRequestBodySchema.safeParseAsync(req.body);

  if (validationResult.error) {
    return res.status(400).json({ error: validationResult.error.format() });
  }

  const { firstname, lastname, email, password } = validationResult.data;

  const [existingUser] = await db
    .select({
      id: usersTable.id,
    })
    .from(usersTable)
    .where(eq(usersTable.email, email));

  const salt = randomBytes(256).toString("hex");
  const hashedPassword = createHmac("sha256", salt)
    .update(password)
    .digest("hex");

  if (existingUser)
    return res
      .status(400)
      .json({ error: `User with this email ${email} already exists!` });

  const [user] = await db
    .insert(usersTable)
    .values({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      salt,
    })
    .returning({ id: usersTable.id });

  return res.status(201).json({ data: { userId: user.id } });
});

export default router;
