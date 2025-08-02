import axios from "axios";
import { downloadMediaMessage } from "@whiskeysockets/baileys";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const {
      url,
      mediaKey,
      mimetype,
      directPath,
      fileLength,
      mediaKeyTimestamp,
    } = req.body;

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
            mediaKeyTimestamp: Number(mediaKeyTimestamp),
            directPath,
            fileLength: Number(fileLength),
          },
        },
      },
      {},
      { reuploadRequest: async () => null }
    );

    // ✅ Ambil ekstensi dari mimetype
    const ext = mimetype?.split("/")[1] || "bin";
    const filename = `whatsapp-media.${ext}`;

    // ✅ Set response headers supaya browser download dengan nama file yang benar
    res.setHeader("Content-Type", mimetype);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    return res.status(200).send(decrypted);
  } catch (err) {
    console.error("DECRYPT ERROR:", err);
    return res.status(500).json({ error: "Failed to decrypt" });
  }
}
