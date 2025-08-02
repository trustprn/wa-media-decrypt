import axios from "axios";
import { downloadMediaMessage } from "@whiskeysockets/baileys";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const { url, mediaKey, mimetype, directPath, fileLength } = req.body;

    const decrypted = await downloadMediaMessage(
      {
        key: {
          remoteJid: "dummy@dummy",
          fromMe: false,
          id: "dummy",
        },
        message: {
          imageMessage: {
            url,
            mimetype,
            mediaKey: Buffer.from(mediaKey, "base64"),
            fileEncSha256: Buffer.alloc(32), // optional
            fileSha256: Buffer.alloc(32), // optional
            mediaKeyTimestamp: 0,
            directPath, // ✅ isi sesuai body
            fileLength: Number(fileLength), // ✅ pastikan ini number
          },
        },
      },
      {},
      { reuploadRequest: async () => null }
    );

    res.setHeader("Content-Type", mimetype);
    return res.status(200).send(decrypted);
  } catch (err) {
    console.error("DECRYPT ERROR:", err);
    return res.status(500).json({ error: "Failed to decrypt" });
  }
}
