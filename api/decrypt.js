import axios from "axios";
import { downloadMediaMessage } from "@whiskeysockets/baileys";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const { url, mediaKey, mimetype } = req.body;

    const encrypted = (await axios.get(url, { responseType: "arraybuffer" }))
      .data;

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
            fileEncSha256: Buffer.alloc(32),
            fileSha256: Buffer.alloc(32),
            mediaKeyTimestamp: 0,
            directPath: "",
            fileLength: "0",
          },
        },
      },
      {},
      { reuploadRequest: async () => null }
    );

    res.setHeader("Content-Type", mimetype);
    return res.status(200).send(decrypted);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to decrypt" });
  }
}
