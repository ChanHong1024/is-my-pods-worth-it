# Is my Pods Worth It?

> AirPods 分型號聆聽統計工具 · 100% 本機離線解析 Apple 健康匯出檔

[繁體中文（香港）](README.zh-HK.md) | **繁體中文（台灣）** | [简体中文](README.zh-CN.md) | [English](README.md) | [日本語](README.ja.md) | [한국어](README.ko.md)

🔗 **Live Demo：** https://chanhong1024.github.io/is-my-pods-worth-it/

![Is my Pods Worth It?](og-image.png)

一個純前端的靜態網站，採用 Apple「Liquid Glass」玻璃擬態 UI 打造。你只要將 iPhone「健康」App 匯出的 `export.zip`（或 `export.xml`）拖進去，它就會自動：

- 擷取每筆 `HeadphoneAudioExposure`（耳機音量）紀錄中的硬體型號（Model ID）與裝置名稱
- 依型號分組，計算出：
  - 總聆聽時長
  - 時間加權平均音量
  - 最高紀錄音量
  - 使用日期範圍
  - 取樣紀錄筆數
  - **建議售價（RRP）**
  - **每小時聆聽成本**
  - **CP 值評分（0–100）**

## 功能特色

- 🔒 **100% 本機**：所有解析都在瀏覽器完成，資料**絕不**上傳，離線也能用
- 🎧 **分型號識別**：內建 Apple 耳機 Model 對照表（AirPods 1/2/3/4/5、AirPods Pro 1/2/3、AirPods Max 1/2），可分辨 AirPods Pro 第幾代（Lightning／USB-C 都分得出來）；也支援 **Sony XM 系列**（WH-1000XM 耳罩式、WF-1000XM 真無線）
- 🔢 **相容 hex 型號**：部分 iOS 版本在 export 中以 Apple 藍牙 Product ID 顯示（例如 `0x200E`＝AirPods Pro 1、`0x2014`＝AirPods Pro 2），已內建對照；有線 EarPods 也會自動標示
- 🌐 **六種語言**：繁體中文（香港／台灣）、簡體中文、English、日本語、한국어 一鍵切換，自動偵測瀏覽器語言
- 🧊 **Liquid Glass UI**：Tailwind CSS + 玻璃擬態（backdrop-blur、specular 高光）
- 💰 **CP 值評分**：內建 RRP（HK$，參考值，可自行調整），以「每小時聆聽成本」換算 0–100 分，越高越划算
- 📊 **裝置詳情 Dashboard**：點卡片進入獨立詳情頁（可返回、網址可分享），有 KPI、每日/每週/每月使用量圖（含音量走勢線）、日曆熱力圖、星期分布、每月總量、**Chronodex 24 小時時間分布錶盤**，以及 `7日/30日/90日/1年/全部`＋自訂日期範圍篩選
- 📤 **一鍵產生分享圖**：彈出設定視窗，可選擇比例（4:5／1:1／9:16）、深／淺色、排序、勾選要分享的裝置、自訂標題、切換每小時成本；即時預覽，可分享到 Threads／IG 或下載 PNG（Canvas 純前端）
- 📱 **響應式**：手機單欄、桌面多欄
- ⚡ **串流解析**：大檔案以分塊（chunk）串流處理，不會卡住

## 支援語言

| 語言 | 代碼 |
| --- | --- |
| 繁體中文（香港） | `zh-HK` |
| 繁體中文（台灣） | `zh-TW` |
| 簡體中文 | `zh-CN` |
| English | `en` |
| 日本語 | `ja` |
| 한국어 | `ko` |

右上角下拉選單可隨時切換，選擇會記住；首次到訪會自動偵測瀏覽器語言。

## 支援裝置

- **Apple**
  - AirPods（第 1–5 代，包含 ANC 與無線充電版本）
  - AirPods Pro（第 1–3 代；Lightning 與 USB-C）
  - AirPods Max（第 1 代 Lightning／USB-C，以及 Max 2）
  - EarPods（有線）
- **Sony**
  - WH-1000XM3 / XM4 / XM5 / XM6（耳罩式）
  - WF-1000XM3 / XM4 / XM5（真無線）
- 未知或其他藍牙／有線裝置會自動分組並標示。

## 使用方法

1. 在 iPhone 開啟「健康」App → 右上角個人頭像 → **匯出所有健康資料**
2. 將匯出的 `export.zip` 拖入網頁（或選擇 `export.xml`）
3. 立即看到分型號統計

> 忘記步驟？點選上傳區右上角的 **?** 按鈕，會有逐步匯出教學（會跟隨你選擇的語言）。

## 技術棧

- [Tailwind CSS](https://tailwindcss.com/)（Play CDN，免 build）
- [fflate](https://github.com/101arrowz/fflate)（ZIP 解壓縮）
- Google Fonts — Noto Sans TC / SC / JP / KR
- 純 HTML + Vanilla JS，無任何後端

## GitHub Pages 部署

1. 將這個 repo push 到 GitHub
2. 前往 **Settings → Pages**
3. 在「Build and deployment」下方：
   - **Source**：`Deploy from a branch`
   - **Branch**：`master`／`(root)`
4. 儲存後，幾分鐘內就會出現網址 `https://<username>.github.io/is-my-pods-worth-it/`

## 本機預覽

直接開啟 `index.html` 即可（`fflate` 與 Tailwind 使用 CDN，需要上網載入一次；之後解析完全離線）。
