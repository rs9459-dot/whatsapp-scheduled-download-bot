import json
import shutil
import time
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

from classifier import classify_file


DOWNLOADS_FOLDER = Path("/Users/rheashastri/Downloads")
CONFIG_FILE = Path("config.json")


def load_config():
    with open(CONFIG_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def wait_until_file_ready(path, timeout=20):
    start = time.time()
    last_size = -1

    while time.time() - start < timeout:
        if not path.exists():
            time.sleep(1)
            continue

        size = path.stat().st_size

        if size == last_size and size > 0:
            return True

        last_size = size
        time.sleep(1)

    return False


def copy_file(src, dest_folder):
    dest_folder = Path(dest_folder)
    dest_folder.mkdir(parents=True, exist_ok=True)

    dest = dest_folder / src.name

    if dest.exists():
        stem = src.stem
        suffix = src.suffix
        counter = 1

        while dest.exists():
            dest = dest_folder / f"{stem}_{counter}{suffix}"
            counter += 1

    shutil.copy2(src, dest)
    return dest


def process_file(filepath):
    filepath = Path(filepath)

    if filepath.name.startswith("."):
        return

    if filepath.suffix.lower() in [".crdownload", ".tmp", ".part"]:
        return

    if not wait_until_file_ready(filepath):
        print(f"⚠️ File not ready: {filepath.name}")
        return

    config = load_config()

    project, target_folder, reason = classify_file(
        filepath.name,
        config,
        str(filepath)
    )

    if not target_folder:
        print(f"❌ No match: {filepath.name} — left in Downloads")
        return

    copied_to = copy_file(filepath, target_folder)

    print(f"✅ Copied: {filepath.name}")
    print(f"📁 To: {copied_to}")
    print(f"🧠 Reason: {reason}")


class DownloadHandler(FileSystemEventHandler):
    def on_created(self, event):
        if not event.is_directory:
            process_file(event.src_path)

    def on_moved(self, event):
        if not event.is_directory:
            process_file(event.dest_path)


if __name__ == "__main__":
    print(f"👀 Watching Downloads: {DOWNLOADS_FOLDER}")

    observer = Observer()
    observer.schedule(
        DownloadHandler(),
        str(DOWNLOADS_FOLDER),
        recursive=False
    )

    observer.start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()

    observer.join()