import express from "express";
import {
  signupPostRequestRequestBodySchema,
  loginPostRequestSchema,
} from "../validations/request.validation.js";
import { hashPasswordWithSalt } from "../utils/hash.js";
import { createUser, getUserByEmail } from "../services/user.service.js";
import { creatUserToken } from "../utils/token.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  const validationResult =
    await signupPostRequestRequestBodySchema.safeParseAsync(req.body);

  if (validationResult.error) {
    return res.status(400).json({ error: validationResult.error.format() });
  }

  const { firstname, lastname, email, password } = validationResult.data;

  const existingUser = await getUserByEmail(email);

  const { salt, password: hashedPassword } = hashPasswordWithSalt(password);

  if (existingUser)
    return res
      .status(400)
      .json({ error: `User with this email ${email} already exists!` });

  const user = await createUser(
    firstname,
    lastname,
    email,
    hashedPassword,
    salt,
  );

  return res.status(201).json({ data: { userId: user.id } });
});

router.post("/login", async (req, res) => {
  const validationResult = await loginPostRequestSchema.safeParseAsync(
    req.body,
  );

  if (validationResult.error) {
    return res.status(400).json({ error: validationResult.error });
  }

  const { email, password } = validationResult.data;

  const user = await getUserByEmail(email);

  if (!user) {
    return res
      .status(404)
      .json({ error: `User with email${email} does not exists` });
  }

  const { password: hashedPassword } = hashPasswordWithSalt(
    password,
    user.salt,
  );

  if (user.password !== hashedPassword) {
    return res.status(400).json({ error: "Invalid password" });
  }

  const token = await creatUserToken({ id: user.id })

  return res.json({ token });
});

export default router;
