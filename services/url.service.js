import { db } from "../db/index.js";
import { urlsTable } from "../models/url.model.js";
import { nanoid } from "nanoid";

export async function insertInDB({ url, code, userId }) {
  const shortCode = code ?? nanoid(6);

  const [result] = await db
    .insert(urlsTable)
    .values({
      shortCode,
      targetURL: url,
      userId: userId,
    })
    .returning({
      id: urlsTable.id,
      shortCode: urlsTable.shortCode,
      targetURL: urlsTable.targetURL,
    });

  return result;
}
