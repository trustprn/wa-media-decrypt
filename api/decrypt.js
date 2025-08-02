import axios from "axios";
import { downloadMediaMessage } from "@whiskeysockets/baileys";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const { url, mediaKey, mimetype, fileLength, directPath } = req.body;

    if (!url || !mediaKey || !mimetype || !fileLength || !directPath) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const decryptedBuffer = await downloadMediaMessage(
      {
        key: {
          remoteJid: "dummy@g.us",
          fromMe: false,
          id: "msgid",
        },
        message: {
          imageMessage: {
            url,
            mimetype,
            mediaKey: Buffer.from(mediaKey, "base64"),
            fileEncSha256: Buffer.alloc(32),
            fileSha256: Buffer.alloc(32),
            mediaKeyTimestamp: 0,
            directPath,
            fileLength: fileLength.toString(),
          },
        },
      },
      {},
      { reuploadRequest: async () => null }
    );

    const extension = mimetype.split("/")[1] || "bin";
    const fileName = `media-${Date.now()}.${extension}`;

    res.setHeader("Content-Type", mimetype);
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.status(200).end(decryptedBuffer);
  } catch (error) {
    console.error("❌ Decrypt failed:", error);
    res
      .status(500)
      .json({ error: "Failed to decrypt", message: error.message });
  }
}
