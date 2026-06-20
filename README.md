# WhatsApp Download Scheduler Setup Guide

## 1. Install Prerequisites

Install:

* Node.js (v20+ recommended)
* Python 3.10+
* Google Chrome
* Visual Studio Code

Verify:

```bash
node -v
npm -v
python3 --version
```

---

## 2. Clone Project

```bash
git clone <repository-url>
cd whatsapp_downloads
```

---

## 3. Install Node Dependencies

```bash
npm install
```

Required packages:

```bash
npm install whatsapp-web.js qrcode-terminal
```

---

## 4. Install Python Dependencies

```bash
pip3 install -r requirements.txt
```

requirements.txt:

```txt
watchdog
pypdf
python-docx
openpyxl
```

---

## 5. Update Local Paths

Edit:

```js
const DOWNLOADS_DIR = "/Users/username/Downloads";
```

Update:

```python
DOWNLOADS_FOLDER = Path("/Users/username/Downloads")
```

Update `config.json`:

```json
{
  "base_folder": "/Users/username/Desktop/CMD"
}
```

---

## 6. Create lastMessage.json and edit target group in index.js file according to whatsapp group you want the download to be activated


```json
{
  "Ai testing": "",
  "Watrana Group": ""
}
```
index.js file
const TARGET_GROUPS = [
  "Ai testing",
  "Watrana Group"
];
---

## 7. First Run

```bash
node index.js
```

Scan the WhatsApp QR code.

After successful login, `.wwebjs_auth` will be created.

---

## 8. Start File Watcher

```bash
python3 watcher.py
```

This process must remain running.

---

## 9. Configure Scheduler

Edit cron:

```bash
crontab -e
```

Add:

```bash
0 11 * * * cd /path/to/project && node index.js
0 15 * * * cd /path/to/project && node index.js
0 19 * * * cd /path/to/project && node index.js
```
press esc and :wq to save and quit 
Schedules:

* 11:00 AM
* 3:00 PM
* 7:00 PM

---

## 10. Workflow

```text
WhatsApp Group
        ↓
Scheduler starts bot
        ↓
Bot checks last downloaded message
        ↓
Downloads new files
        ↓
Files saved to Downloads
        ↓
watcher.py detects files
        ↓
Files moved into CMD folders
```

---

## Notes

* The laptop must be ON at scheduler time.
* If a schedule is missed, the next scheduler downloads all missed files.
* Do not delete `.wwebjs_auth`.
* Do not run multiple instances of `index.js`.
* Group names in `TARGET_GROUPS` must exactly match WhatsApp group names.

---

## Manual Test

```bash
node index.js
```

---

## Verify Scheduler

```bash
crontab -l
```

---

## View Logs

```bash
pm2 logs
```

or

```bash
cat scheduler.log
```
# PM2 Setup

## Install PM2

```bash
npm install -g pm2
```

Verify:

```bash
pm2 -v
```

---

## Run watcher.py permanently

```bash
cd whatsapp_downloads

pm2 start watcher.py \
  --interpreter python3 \
  --name whatsapp-watcher
```

Check:

```bash
pm2 status
```

View logs:

```bash
pm2 logs whatsapp-watcher
```

---

## Save PM2 Processes

```bash
pm2 save
```

---

## Auto-start after reboot

```bash
pm2 startup
```

Copy and execute the command shown by PM2.

Then:

```bash
pm2 save
```

---

## Restart watcher

```bash
pm2 restart whatsapp-watcher
```

---

## Stop watcher

```bash
pm2 stop whatsapp-watcher
```

---

## Delete watcher

```bash
pm2 delete whatsapp-watcher
```

---

# Important

Do NOT run:

```bash
pm2 start index.js
```

The scheduled WhatsApp downloader is started by cron:

```bash
0 11 * * * node index.js
0 15 * * * node index.js
0 19 * * * node index.js
```

Running `index.js` continuously in PM2 can cause:

```text
Error: The browser is already running for session-download-bot
```

because multiple WhatsApp sessions try to use the same browser profile.
