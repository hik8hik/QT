#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Add the missing ExportButton import to MushafPage.tsx."""
import os, sys

CANDIDATES = [
    "src/components/MushafPage.tsx",
    "quran-tweed-app/src/components/MushafPage.tsx",
    "quran-tajweed-app/src/components/MushafPage.tsx",
]

path = next((p for p in CANDIDATES if os.path.isfile(p)), None)
if not path:
    print("Could not find src/components/MushafPage.tsx.")
    print("Run this from inside the project folder.")
    sys.exit(1)

with open(path, "r", encoding="utf-8") as f:
    src = f.read()

needle = 'import { useSettings } from "@/context/SettingsContext";'
replacement = (
    'import { useSettings } from "@/context/SettingsContext";\n'
    'import ExportButton from "./ExportButton";'
)

if 'import ExportButton from "./ExportButton";' in src:
    print("Already imported — nothing to do.")
    sys.exit(0)

if needle not in src:
    print("Could not find the anchor import line.")
    sys.exit(1)

src = src.replace(needle, replacement, 1)

with open(path, "w", encoding="utf-8") as f:
    f.write(src)

print("Fixed " + path)
print("Next.js will hot-reload on the next request.")