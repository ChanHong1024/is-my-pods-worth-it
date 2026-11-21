# Is my Pods Worth It?

> AirPods 分型号聆听统计工具 · 100% 本地离线解析 Apple 健康导出文件

[繁體中文（香港）](README.zh-HK.md) | [繁體中文（台灣）](README.zh-TW.md) | **简体中文** | [English](README.md) | [日本語](README.ja.md) | [한국어](README.ko.md)

🔗 **Live Demo：** https://chanhong1024.github.io/is-my-pods-worth-it/

![Is my Pods Worth It?](og-image.png)

一个纯前端静态网站，采用 Apple“Liquid Glass”玻璃拟态 UI 打造。你只需将 iPhone“健康”App 导出的 `export.zip`（或 `export.xml`）拖进来，它就会自动：

- 提取每条 `HeadphoneAudioExposure`（耳机音量）记录中的硬件型号（Model ID）与设备名称
- 按型号分组，计算：
  - 总聆听时长
  - 时间加权平均音量
  - 最高记录音量
  - 使用日期范围
  - 采样记录条数
  - **建议零售价（RRP）**
  - **每小时聆听成本**
  - **CP 值评分（0–100）**

## 功能特色

- 🔒 **100% 本地**：所有解析都在浏览器完成，数据**绝不上传**，离线也能用
- 🎧 **分型号识别**：内置 Apple 耳机 Model 对照表（AirPods 1/2/3/4/5、AirPods Pro 1/2/3、AirPods Max 1/2），可分辨 AirPods Pro 第几代（Lightning／USB-C 都分得出）；也支持 **Sony XM 系列**（WH-1000XM 头戴式、WF-1000XM 真无线）
- 🔢 **兼容 hex 型号**：部分 iOS 版本在 export 中以 Apple 蓝牙 Product ID 显示（例如 `0x200E`＝AirPods Pro 1、`0x2014`＝AirPods Pro 2），已内置对照；有线 EarPods 也会自动标示
- 🌐 **六种语言**：繁体中文（香港／台湾）、简体中文、English、日本語、한국어 一键切换，自动检测浏览器语言
- 🧊 **Liquid Glass UI**：Tailwind CSS + 玻璃拟态（backdrop-blur、specular 高光）
- 💰 **CP 值评分**：内置 RRP（HK$，参考值，可自行调整），按“每小时聆听成本”换算 0–100 分，越高越划算
- 📊 **设备详情 Dashboard**：点击卡片进入独立详情页（可返回、网址可分享），有 KPI、每日/每周/每月使用量图（含音量走势线）、日历热力图、星期分布、每月总量、**Chronodex 24 小时时间分布表盘**，以及 `7天/30天/90天/1年/全部`＋自定义日期范围筛选
- 📤 **一键生成分享图**：弹出设置窗口，可选择比例（4:5／1:1／9:16）、深／浅色、排序、勾选要分享的设备、自定义标题、切换每小时成本；实时预览，可分享到 Threads／IG 或下载 PNG（Canvas 纯前端）
- 📱 **响应式**：手机单栏、桌面多栏
- ⚡ **流式解析**：大文件以分块（chunk）流式处理，不会卡死

## 支持语言

| 语言 | 代码 |
| --- | --- |
| 繁体中文（香港） | `zh-HK` |
| 繁体中文（台湾） | `zh-TW` |
| 简体中文 | `zh-CN` |
| English | `en` |
| 日本語 | `ja` |
| 한국어 | `ko` |

右上角下拉菜单可随时切换，选择会被记住；首次访问会自动检测浏览器语言。

## 支持设备

- **Apple**
  - AirPods（第 1–5 代，包括 ANC 与无线充电版本）
  - AirPods Pro（第 1–3 代；Lightning 与 USB-C）
  - AirPods Max（第 1 代 Lightning／USB-C，以及 Max 2）
  - EarPods（有线）
- **Sony**
  - WH-1000XM3 / XM4 / XM5 / XM6（头戴式）
  - WF-1000XM3 / XM4 / XM5（真无线）
- 未知或其他蓝牙／有线设备会自动分组并标示。

## 使用方法

1. 在 iPhone 打开“健康”App → 右上角个人头像 → **导出所有健康数据**
2. 将导出的 `export.zip` 拖入网页（或选择 `export.xml`）
3. 立即看到分型号统计

> 忘记步骤？点击上传区右上角的 **?** 按钮，会有逐步导出教程（会跟随你选择的语言）。

## 项目结构

| 文件 | 用途 |
| --- | --- |
| `index.html` | 仅放 HTML 结构 |
| `styles.css` | 自定义样式（玻璃 UI、图表、动画） |
| `app.js` | 解析、i18n、图表、分享图 |
| `devices.js` | **支持的设备数据**：型号名称＋建议零售价。新增型号或改价格改这个文件 |

新增设备：打开 `devices.js`，Apple 在 `MODEL_MAP` 与 `PRICE_APPLE` 各加一行；Sony 在 `PRICE_SONY` 加一行。繁体中文（台湾／大陆）、日文、韩文名称会自动由 `zh-HK`／`en` 转换。

## 技术栈

- [Tailwind CSS](https://tailwindcss.com/)（Play CDN，免 build）
- [fflate](https://github.com/101arrowz/fflate)（ZIP 解压）
- Google Fonts — Noto Sans TC / SC / JP / KR
- 纯 HTML + Vanilla JS，无任何后端

## GitHub Pages 部署

1. 将这个 repo push 到 GitHub
2. 前往 **Settings → Pages**
3. 在“Build and deployment”下方：
   - **Source**：`Deploy from a branch`
   - **Branch**：`master`／`(root)`
4. 保存后，几分钟内就会出现网址 `https://<username>.github.io/is-my-pods-worth-it/`

## 本地预览

直接打开 `index.html` 即可（`fflate` 与 Tailwind 使用 CDN，需要联网加载一次；之后解析完全离线）。
