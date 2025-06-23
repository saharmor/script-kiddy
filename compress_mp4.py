#!/usr/bin/env python3
"""
compress_mp4.py
===============
A tiny command‑line utility to shrink .mp4 files using **ffmpeg**.

It offers five compression levels:
1. **Level 1 (Low Compression)**: Highest quality, largest file (CRF 18).
2. **Level 2 (Medium-Low Compression)**: Very good quality (CRF 23).
3. **Level 3 (Medium Compression)**: Good quality, smaller file (CRF 28) - default.
4. **Level 4 (High Compression)**: Acceptable quality, much smaller file (CRF 33).
5. **Level 5 (Aggressive Compression)**: Lowest practical quality, smallest file (CRF 38).

It can also use bit‑rate‑based compression for precise file‑size targets.

The script is intentionally lightweight, depending only on the Python standard library
and a local **ffmpeg** binary. (If `ffmpeg` is missing, it tells you how to install it.)

Usage
-----
```bash
python compress_mp4.py input.mp4            # exports `input_compressed.mp4` at Level 3 (CRF 28)
python compress_mp4.py input.mp4 -o out.mp4 # custom output name
python compress_mp4.py input.mp4 -l 5       # aggressive compression (CRF 38)
python compress_mp4.py input.mp4 --bitrate 1M  # ~1 Mbit/s target bit‑rate, two‑pass
python compress_mp4.py input.mp4 -l 2 -p fast --max-width 1280
```

Arguments
~~~~~~~~~
```
positional:
  input                 Path to the source .mp4 file
optional:
  -o, --output          Output path (default: <input>_compressed.mp4)
  -l, --level           Compression level (1-5). 1=low compression/best quality,
                        5=aggressive compression/smallest size. [default: 3]
                        Level 1: CRF 18
                        Level 2: CRF 23
                        Level 3: CRF 28
                        Level 4: CRF 33
                        Level 5: CRF 38
                        This is ignored if --bitrate is used.
  -b, --bitrate         Video bit‑rate target (e.g. 800k, 2M). If given, two‑pass
                        encoding is used and --level is ignored.
  -p, --preset          ffmpeg/ x264 preset: ultrafast|superfast|veryfast|faster|
                        fast|medium|slow|slower|veryslow [default: medium]
  --max-width           Maximum width (px) — keeps aspect ratio
  --max-height          Maximum height (px) — keeps aspect ratio
  --dry-run             Print ffmpeg command without executing it
```

Examples and more details are in the README section at the bottom.
"""

import argparse
import shutil
import subprocess
import sys
from pathlib import Path

# Define CRF values for each compression level
CRF_LEVELS = {
    1: 18,  # Low compression, highest quality
    2: 23,  # Medium-low compression, very good quality
    3: 28,  # Medium compression, good quality (default)
    4: 33,  # High compression, acceptable quality
    5: 38,  # Aggressive compression, smallest size
}


def ffmpeg_exists() -> bool:
    """Return True if ffmpeg binary is found in PATH."""
    return shutil.which("ffmpeg") is not None


def build_scale_filter(max_w: int | None, max_h: int | None) -> str | None:
    """Construct an ffmpeg scale filter string to enforce max width/height."""
    if max_w is None and max_h is None:
        return None

    # Preserve aspect ratio: use -2 so width/height is divisible by 2 (x264 req).
    parts: list[str] = []
    if max_w is not None:
        parts.append(f"'min({max_w},iw)':'-2'")  # limit width
    else:
        parts.append("iw")
    if max_h is not None:
        parts.append(f"'min({max_h},ih)':'-2'")  # limit height
    else:
        parts.append("ih")

    return f"scale={':'.join(parts)}"


def compress(
    src: Path,
    dst: Path,
    *,
    crf: int = 23,
    bitrate: str | None = None,
    preset: str = "medium",
    max_width: int | None = None,
    max_height: int | None = None,
    dry_run: bool = False,
) -> None:
    """Run ffmpeg to compress *src* into *dst*.

    Parameters
    ----------
    src, dst : Path
        Input/output files.
    crf : int
        Constant Rate Factor (0‑51). Ignored if *bitrate* is given.
    bitrate : str | None
        Target bit‑rate (e.g. "800k", "1M"). Enables two‑pass encoding.
    preset : str
        x264 preset. Fast → larger file, slow → smaller file.
    max_width, max_height : int | None
        Resize so neither dimension exceeds the given limit.
    dry_run : bool
        If True, only print the ffmpeg command.
    """

    if not ffmpeg_exists():
        sys.exit(
            "ffmpeg not found. Install it first: https://ffmpeg.org/download.html"
        )

    scale_filter = build_scale_filter(max_width, max_height)

    vf_args = ["-vf", scale_filter] if scale_filter else []

    # Build ffmpeg commands
    if bitrate:
        # Two‑pass encoding for consistent size
        passlog = src.with_suffix(".log")
        pass1 = [
            "ffmpeg",
            "-y",
            "-i",
            str(src),
            *vf_args,
            "-c:v",
            "libx264",
            "-b:v",
            bitrate,
            "-preset",
            preset,
            "-pass",
            "1",
            "-an",
            "-f",
            "mp4",
            "NUL" if sys.platform.startswith("win") else "/dev/null",
        ]
        pass2 = [
            "ffmpeg",
            "-y",
            "-i",
            str(src),
            *vf_args,
            "-c:v",
            "libx264",
            "-b:v",
            bitrate,
            "-preset",
            preset,
            "-pass",
            "2",
            "-c:a",
            "aac",
            "-b:a",
            "128k",
            str(dst),
        ]
        commands = [pass1, pass2]
    else:
        commands = [
            [
                "ffmpeg",
                "-y",
                "-i",
                str(src),
                *vf_args,
                "-c:v",
                "libx264",
                "-crf",
                str(crf),
                "-preset",
                preset,
                "-c:a",
                "aac",
                "-b:a",
                "128k",
                str(dst),
            ]
        ]

    for cmd in commands:
        print(" ", " ".join(cmd))
        if not dry_run:
            res = subprocess.run(cmd)
            if res.returncode != 0:
                sys.exit(res.returncode)

    print(f"✅ Compressed video saved to {dst}")


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:  # noqa: ANN401
    p = argparse.ArgumentParser(description="Compress an .mp4 using ffmpeg")
    p.add_argument("input", type=Path, help="Path to the source .mp4 file")
    p.add_argument(
        "-o",
        "--output",
        type=Path,
        help="Output path (default: <input>_compressed.mp4)",
    )
    p.add_argument(
        "-l",
        "--level",
        type=int,
        default=3,
        choices=CRF_LEVELS.keys(),
        help="Compression level (1-5). 1=low compression/best quality, "
             "5=aggressive compression/smallest size. Default: 3. "
             f"(1={CRF_LEVELS[1]}, 2={CRF_LEVELS[2]}, 3={CRF_LEVELS[3]}, "
             f"4={CRF_LEVELS[4]}, 5={CRF_LEVELS[5]}). Ignored if --bitrate is used.",
    )
    p.add_argument(
        "-b",
        "--bitrate",
        help="Target video bit‑rate (eg. 800k, 2M). Overrides --level.",
    )
    p.add_argument(
        "-p",
        "--preset",
        default="medium",
        help="x264 preset: ultrafast|superfast|veryfast|faster|fast|medium|slow|slower|veryslow",
    )
    p.add_argument("--max-width", type=int, help="Maximum width in pixels")
    p.add_argument("--max-height", type=int, help="Maximum height in pixels")
    p.add_argument("--dry-run", action="store_true", help="Print ffmpeg command only")
    return p.parse_args(argv)


def main(argv: list[str] | None = None) -> None:
    args = parse_args(argv)

    input_path: Path = args.input
    output_path: Path = (
        args.output
        if args.output is not None
        else input_path.with_name(input_path.stem + "_compressed.mp4")
    )

    # Determine CRF value based on the selected level
    crf_value = CRF_LEVELS[args.level]

    compress(
        src=input_path,
        dst=output_path,
        crf=crf_value,
        bitrate=args.bitrate,
        preset=args.preset,
        max_width=args.max_width,
        max_height=args.max_height,
        dry_run=args.dry_run,
    )


if __name__ == "__main__":
    main()
