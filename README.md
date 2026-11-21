# Is my Pods Worth It?

> Per-model headphone listening stats · 100% local, offline parsing of Apple Health exports

[繁體中文（香港）](README.zh-HK.md) | [繁體中文（台灣）](README.zh-TW.md) | [简体中文](README.zh-CN.md) | **English** | [日本語](README.ja.md) | [한국어](README.ko.md)

🔗 **Live demo:** https://chanhong1024.github.io/is-my-pods-worth-it/

![Is my Pods Worth It?](og-image.png)

A pure front-end static site built with Apple's "Liquid Glass" glassmorphism UI. Just drop the `export.zip` (or `export.xml`) exported from the iPhone Health app, and it will automatically:

- Extract the hardware model ID and device name from every `HeadphoneAudioExposure` record
- Group by model and compute:
  - Total listening time
  - Time-weighted average volume
  - Peak recorded volume
  - Usage date range
  - Number of samples
  - **Recommended retail price (RRP)**
  - **Cost per hour of listening**
  - **CP value score (0–100)**

## Features

- 🔒 **100% local** — everything is parsed in your browser; data is **never** uploaded and works offline
- 🎧 **Per-model detection** — built-in Apple headphone model map (AirPods 1/2/3/4/5, AirPods Pro 1/2/3, AirPods Max 1/2), including which AirPods Pro generation (Lightning / USB-C), plus **Sony XM series** (WH-1000XM over-ear, WF-1000XM true wireless)
- 🔢 **Hex model IDs** — some iOS versions report Apple Bluetooth Product IDs instead (e.g. `0x200E` = AirPods Pro 1, `0x2014` = AirPods Pro 2); wired EarPods are labelled too
- 🌐 **Six languages** — Traditional Chinese (Hong Kong / Taiwan), Simplified Chinese, English, Japanese, and Korean, with a one-click switcher and automatic browser-language detection
- 🧊 **Liquid Glass UI** — Tailwind CSS + glassmorphism (backdrop-blur, specular highlights)
- 💰 **CP value score** — built-in RRP (HKD, reference values, adjustable), converted from cost-per-hour into a 0–100 score; the higher, the better the value
- 📊 **Device dashboard** — tap a card to open a dedicated, shareable detail page (back button + shareable URL) with KPIs, daily/weekly/monthly usage charts (with volume trend line), calendar heatmap, weekday distribution, monthly totals, a **Chronodex time-of-day dial**, and `7d / 30d / 90d / 1y / All` + custom date-range filters
- 📤 **One-tap share image** — a config popup lets you pick the aspect ratio (4:5 / 1:1 / 9:16), dark/light theme, sort order, which devices to include, a custom title, and whether to show cost-per-hour; live preview, then share to Threads / IG or download a PNG (pure Canvas)
- 📱 **Responsive** — single column on mobile, multi-column on desktop
- ⚡ **Streaming parser** — large files are processed in chunks so the UI never freezes

## Supported languages

| Language | Code |
| --- | --- |
| Traditional Chinese (Hong Kong) | `zh-HK` |
| Traditional Chinese (Taiwan) | `zh-TW` |
| Simplified Chinese | `zh-CN` |
| English | `en` |
| Japanese | `ja` |
| Korean | `ko` |

Switch anytime from the top-right dropdown; the choice is remembered, and the browser language is detected automatically on the first visit.

## Supported devices

- **Apple**
  - AirPods (1st–5th generation, including ANC and wireless-charging variants)
  - AirPods Pro (1st–3rd generation; Lightning and USB-C)
  - AirPods Max (1st generation Lightning / USB-C, and Max 2)
  - EarPods (wired)
- **Sony**
  - WH-1000XM3 / XM4 / XM5 / XM6 (over-ear)
  - WF-1000XM3 / XM4 / XM5 (true wireless)
- Unknown or other Bluetooth/wired devices are grouped and labelled automatically.

## Usage

1. On your iPhone, open the **Health** app → profile picture (top right) → **Export All Health Data**
2. Drag the exported `export.zip` into the site (or pick `export.xml`)
3. See the per-model stats instantly

> Forgot the steps? Tap the **?** button at the top-right of the upload area for a step-by-step guide in your language.

## Tech stack

- [Tailwind CSS](https://tailwindcss.com/) (Play CDN, no build step)
- [fflate](https://github.com/101arrowz/fflate) (ZIP decompression)
- Google Fonts — Noto Sans TC / SC / JP / KR
- Pure HTML + vanilla JS, no backend

## GitHub Pages deployment

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Under "Build and deployment":
   - **Source**: `Deploy from a branch`
   - **Branch**: `master` / `(root)`
4. Save; the URL `https://<username>.github.io/is-my-pods-worth-it/` is live within a few minutes

## Local preview

Just open `index.html` directly (Tailwind and fflate load from their CDNs once; parsing is fully offline afterwards).
