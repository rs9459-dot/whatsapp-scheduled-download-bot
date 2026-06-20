const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const fs = require("fs");
const path = require("path");

const DOWNLOADS_DIR = "/Users/rheashastri/Downloads";

const TARGET_GROUPS = [
  "Ai testing",
  "Watrana Group"
];

if (!fs.existsSync(DOWNLOADS_DIR)) {
  fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
}

const client = new Client({
  authStrategy: new LocalAuth({
    clientId: "download-bot"
  }),
  puppeteer: {
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  }
});

client.on("qr", qr => {
  console.log("📱 Scan QR:");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("✅ WhatsApp download bot ready");
  console.log("📁 Downloads:", DOWNLOADS_DIR);
  console.log("🎯 Groups:", TARGET_GROUPS);
});

client.on("message_create", async message => {
  try {
    const chat = await message.getChat();

    console.log("---------------");
    console.log("📩 Message received");
    console.log("👥 Chat:", chat.name);
    console.log("📌 Is group:", chat.isGroup);
    console.log("📎 Has media:", message.hasMedia);
    console.log("💬 Body:", message.body);

    if (!chat.isGroup) return;

    if (!TARGET_GROUPS.includes(chat.name)) {
      console.log("⏭️ Group ignored");
      return;
    }

    if (!message.hasMedia) {
      console.log("ℹ️ No media in this message");
      return;
    }

    console.log("⬇️ Downloading media...");
    const media = await message.downloadMedia();

    if (!media || !media.data) {
      console.log("❌ downloadMedia returned empty");
      return;
    }

    let filename =
      message._data?.filename ||
      message._data?.caption ||
      `whatsapp_file_${Date.now()}`;

    filename = filename.replace(/[\/\\?%*:|"<>]/g, "_");

    let ext = "";

    if (media.mimetype.includes("pdf")) ext = ".pdf";
    else if (media.mimetype.includes("word")) ext = ".docx";
    else if (media.mimetype.includes("spreadsheet")) ext = ".xlsx";
    else if (media.mimetype.includes("presentation")) ext = ".pptx";
    else if (media.mimetype.includes("image/jpeg")) ext = ".jpg";
    else if (media.mimetype.includes("image/png")) ext = ".png";
    else {
      ext = "." + media.mimetype.split("/")[1].split(";")[0];
    }

    if (!path.extname(filename)) {
      filename += ext;
    }

    const filePath = path.join(DOWNLOADS_DIR, filename);

    fs.writeFileSync(filePath, Buffer.from(media.data, "base64"));

    console.log("✅ File downloaded successfully");
    console.log("📄 File:", filename);
    console.log("📁 Path:", filePath);

  } catch (err) {
    console.error("❌ Error:", err);
  }
});

client.initialize();