import { downloadMediaMessage } from "@whiskeysockets/baileys";
import axios from "axios";
import { writeFile } from "fs/promises";

export default async function handler(req, res) {
  const { url, mimetype, mediaKey, fileLength, directPath } = req.body;

  try {
    const stream = await downloadMediaMessage(
      {
        key: {
          remoteJid: "dummy@g.us",
          id: "dummy",
          fromMe: false,
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
      "buffer",
      {
        reuploadRequest: async () => null,
      }
    );

    // Simpan sebagai file dinamis berdasarkan waktu
    const extension = mimetype.split("/")[1]; // jpg, png, etc
    const filename = `media-${Date.now()}.${extension}`;
    await writeFile(`/tmp/${filename}`, stream);

    res.setHeader("Content-Type", mimetype);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.status(200).send(stream);
  } catch (error) {
    console.error("Decryption error:", error);
    res.status(500).json({
      error: "Failed to decrypt",
      details: error.message,
    });
  }
}
