import axios from "axios";
import { downloadMediaMessage } from "@whiskeysockets/baileys";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const { url, mediaKey, mimetype, directPath, fileLength } = req.body;

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
            directPath: directPath,
            fileLength: fileLength.toString(),
          },
        },
      },
      {},
      { reuploadRequest: async () => null }
    );

    // DYNAMIC FILE EXTENSION
    const ext = mimetype?.split("/")[1] || "bin";
    const fileName = `whatsapp-media.${ext}`;

    // SET DOWNLOAD HEADERS
    res.setHeader("Content-Type", mimetype);
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    return res.status(200).end(decrypted); // gunakan .end() agar buffer dikirim langsung
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to decrypt" });
  }
}
