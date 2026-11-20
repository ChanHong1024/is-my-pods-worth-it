# Is my Pods Worth It?

> AirPods 分型號聆聽統計工具 · 100% 本地離線解析 Apple 健康匯出檔

一個純前端嘅靜態網站，用 Apple「Liquid Glass」玻璃擬態 UI 打造。你只需要將 iPhone「健康」App 匯出嘅 `export.zip`（或 `export.xml`）拖入去，佢就會自動：

- 提取每筆 `HeadphoneAudioExposure`（耳機音量）紀錄入面嘅硬件型號（Model ID）與裝置名稱
- 按型號分組，計出：
  - 總聆聽時長
  - 時間加權平均音量
  - 最高記錄音量
  - 使用日期範圍
  - 取樣紀錄筆數

## 特點

- 🔒 **100% 本地**：所有解析都喺瀏覽器完成，資料**永不**上傳，離線都用到
- 🎧 **分型號識別**：內置 Apple 耳機 Model 對照表（AirPods 1/2/3/4/5、AirPods Pro 1/2/3、AirPods Max 1/2），可分辨 AirPods Pro 第幾代（Lightning／USB-C 都分到）
- 🌐 **雙語**：繁體中文（zh-HK）／ English 一鍵切換，自動偵測瀏覽器語言
- 🧊 **Liquid Glass UI**：Tailwind CSS + 玻璃擬態（backdrop-blur、specular 高光）
- 📱 **響應式**：手機單欄、桌面多欄
- ⚡ **串流解析**：大檔案用分塊（chunk）串流處理，唔會卡死

## 使用方法

1. 喺 iPhone 開「健康」App → 右上角個人頭像 → **匯出所有健康資料**
2. 將匯出嘅 `export.zip` 拖入網頁（或者揀 `export.xml`）
3. 即時見到分型號統計

## 技術棧

- [Tailwind CSS](https://tailwindcss.com/)（Play CDN，免 build）
- [fflate](https://github.com/101arrowz/fflate)（ZIP 解壓）
- 純 HTML + Vanilla JS，無任何後端

## GitHub Pages 部署

1. Push 呢個 repo 上 GitHub
2. 去 **Settings → Pages**
3. 喺「Build and deployment」下面：
   - **Source**：`Deploy from a branch`
   - **Branch**：`main`／`(root)`
4. 儲存後，幾分鐘內會出網址 `https://<username>.github.io/is-my-pods-worth-it/`

## 本地預覽

直接開 `index.html` 就得（`fflate` 同 Tailwind 用 CDN，需要上網 load 一次；之後解析完全離線）。
