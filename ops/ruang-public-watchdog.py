#!/usr/bin/env python3
"""Read-only health watchdog for Sentot/Ruang.

Prints only state changes: failure alert once, then recovery alert once.
Designed for Hermes no-agent cron delivery.
"""
from __future__ import annotations

import json
import os
import shutil
import subprocess
import tempfile
from datetime import datetime, timezone
from pathlib import Path

BASE_URL = os.environ.get("RUANG_PUBLIC_URL", "https://ruang.yudhiar.fun").rstrip("/")
EXPECTED_PROFILES = int(os.environ.get("RUANG_EXPECTED_PROFILES", "13"))
DISK_WARN_PERCENT = int(os.environ.get("RUANG_DISK_WARN_PERCENT", "85"))
MEM_AVAILABLE_MIN_MIB = int(os.environ.get("RUANG_MEM_AVAILABLE_MIN_MIB", "512"))
STATE_FILE = Path(os.environ.get("RUANG_WATCHDOG_STATE", "/opt/data/scripts/.ruang-watchdog-state.json"))


def get_json(path: str) -> dict:
    result = subprocess.run(
        ["curl", "--fail", "--silent", "--show-error", "--max-time", "15", f"{BASE_URL}{path}"],
        check=True, capture_output=True, text=True, timeout=20,
    )
    value = json.loads(result.stdout)
    if not isinstance(value, dict):
        raise RuntimeError(f"{path} returned non-object JSON")
    return value


def memory_available_mib() -> int:
    for line in Path("/proc/meminfo").read_text().splitlines():
        if line.startswith("MemAvailable:"):
            return int(line.split()[1]) // 1024
    raise RuntimeError("MemAvailable unavailable")


def load_state() -> dict:
    try:
        return json.loads(STATE_FILE.read_text())
    except (FileNotFoundError, json.JSONDecodeError):
        return {"healthy": None, "issues": []}


def save_state(state: dict) -> None:
    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    fd, name = tempfile.mkstemp(prefix=".ruang-watchdog-", dir=STATE_FILE.parent)
    try:
        with os.fdopen(fd, "w") as handle:
            json.dump(state, handle, sort_keys=True)
            handle.write("\n")
        os.replace(name, STATE_FILE)
    finally:
        if os.path.exists(name):
            os.unlink(name)


def main() -> None:
    issues: list[str] = []
    profile_count: int | None = None
    try:
        health = get_json("/api/health")
        if health.get("ok") is not True:
            issues.append("public health payload lacks ok=true")
    except Exception as exc:
        issues.append(f"public health failed: {exc}")

    try:
        runtime = get_json("/api/runtime")
        profiles = runtime.get("profiles", {}).get("data", [])
        if not isinstance(profiles, list):
            raise RuntimeError("profiles.data is not a list")
        profile_count = len(profiles)
        if profile_count != EXPECTED_PROFILES:
            issues.append(f"agent profile count {profile_count}/{EXPECTED_PROFILES}")
    except Exception as exc:
        issues.append(f"runtime failed: {exc}")

    try:
        disk = shutil.disk_usage("/opt/data")
        disk_percent = round(disk.used * 100 / disk.total)
        if disk_percent >= DISK_WARN_PERCENT:
            issues.append(f"disk /opt/data {disk_percent}% used (warning {DISK_WARN_PERCENT}%)")
    except Exception as exc:
        issues.append(f"disk check failed: {exc}")

    try:
        available_mib = memory_available_mib()
        if available_mib < MEM_AVAILABLE_MIN_MIB:
            issues.append(f"memory available {available_mib} MiB (minimum {MEM_AVAILABLE_MIN_MIB} MiB)")
    except Exception as exc:
        issues.append(f"memory check failed: {exc}")

    healthy = not issues
    previous = load_state()
    now = datetime.now(timezone.utc).isoformat(timespec="seconds")
    state = {"healthy": healthy, "issues": issues, "checkedAt": now, "profileCount": profile_count}
    save_state(state)

    if not healthy and (previous.get("healthy") is not False or previous.get("issues") != issues):
        print("ALERT Ruang monitor gagal (UTC " + now + "): " + "; ".join(issues))
    elif healthy and previous.get("healthy") is False:
        print(f"RECOVERY Ruang sehat kembali (UTC {now}): public API OK, {profile_count}/{EXPECTED_PROFILES} profile.")


if __name__ == "__main__":
    main()
