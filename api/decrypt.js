import axios from "axios";
import { downloadMediaMessage } from "@whiskeysockets/baileys";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const { url, mediaKey, mimetype, fileLength, directPath } = req.body;

    // LOG DEBUG (sementara aktifkan ini kalau butuh lihat detail)
    console.log("Decrypt request body:", req.body);

    const mediaBuffer = (await axios.get(url, { responseType: "arraybuffer" }))
      .data;

    const decrypted = await downloadMediaMessage(
      {
        key: {
          remoteJid: "dummy@dummy", // placeholder, nggak berpengaruh
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
            directPath,
            fileLength: Number(fileLength), // harus string
          },
        },
      },
      {}, // baileys client (kosong karena kita cuma pakai tool decrypt-nya)
      { reuploadRequest: async () => null }
    );

    const ext = mimetype?.split("/")[1] || "bin";
    const fileName = `whatsapp-media.${ext}`;

    res.setHeader("Content-Type", mimetype);
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    return res.status(200).end(decrypted);
  } catch (err) {
    console.error("❌ Failed to decrypt:", err);
    return res.status(500).json({ error: "Failed to decrypt" });
  }
}
