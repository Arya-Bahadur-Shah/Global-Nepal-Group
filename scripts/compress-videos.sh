#!/usr/bin/env bash
# One-shot batch compressor for site background videos.
# - Downscale to fit 1920x1080 (no upscaling), H.264 CRF 26, faststart, no audio.
# - Originals are moved to video-originals-backup/ (gitignored) before replacing.
set -u

FF="/c/Users/user/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0-full_build/bin/ffmpeg.exe"
FP="/c/Users/user/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0-full_build/bin/ffprobe.exe"
ROOT="C:/Users/user/Desktop/GNG/gng2"
BACKUP="$ROOT/video-originals-backup"

cd "$ROOT" || exit 1
before_total=0
after_total=0

while IFS= read -r f; do
  rel="${f#public/}"
  bytes_before=$(stat -c%s "$f")
  tmp="${f%.mp4}.__tmp__.mp4"

  "$FF" -nostdin -y -loglevel error -i "$f" \
    -vf "scale=1920:1080:force_original_aspect_ratio=decrease:force_divisible_by=2" \
    -c:v libx264 -crf 26 -preset medium -pix_fmt yuv420p \
    -movflags +faststart -an "$tmp"

  if [ $? -ne 0 ] || [ ! -s "$tmp" ]; then
    echo "FAIL   $f (kept original)"
    rm -f "$tmp"
    continue
  fi
  # Sanity: new file must be a valid video ffprobe can read.
  if ! "$FP" -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 "$tmp" >/dev/null 2>&1; then
    echo "FAIL   $f (bad output, kept original)"
    rm -f "$tmp"
    continue
  fi

  bytes_after=$(stat -c%s "$tmp")
  # If compression didn't help (already tiny), keep original.
  if [ "$bytes_after" -ge "$bytes_before" ]; then
    echo "SKIP   $f (already small: $((bytes_before/1024))KB <= new $((bytes_after/1024))KB)"
    rm -f "$tmp"
    before_total=$((before_total+bytes_before))
    after_total=$((after_total+bytes_before))
    continue
  fi

  mkdir -p "$BACKUP/$(dirname "$rel")"
  mv "$f" "$BACKUP/$rel"
  mv "$tmp" "$f"

  before_total=$((before_total+bytes_before))
  after_total=$((after_total+bytes_after))
  printf "OK     %-70s %5dMB -> %5.1fMB\n" "$rel" "$((bytes_before/1024/1024))" "$(echo "scale=1; $bytes_after/1048576" | bc)"
done < <(find public -type f -name "*.mp4")

echo "----------------------------------------------------------"
printf "TOTAL  %d MB  ->  %d MB\n" "$((before_total/1024/1024))" "$((after_total/1024/1024))"
echo "Originals backed up to: video-originals-backup/"
echo "DONE"
