import express from "express";
import { signupPostRequestRequestBodySchema } from "../validations/request.validation.js";
import { hashPasswordWithSalt } from "../utils/hash.js";
import { createUser, getUserByEmail } from "../services/user.service.js";

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

export default router;
