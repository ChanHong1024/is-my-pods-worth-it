# Is my Pods Worth It?

> AirPods モデル別リスニング統計ツール · Apple ヘルスケアの書き出しを 100% ローカルでオフライン解析

[繁體中文（香港）](README.zh-HK.md) | [繁體中文（台灣）](README.zh-TW.md) | [简体中文](README.zh-CN.md) | [English](README.md) | **日本語** | [한국어](README.ko.md)

🔗 **ライブデモ：** https://chanhong1024.github.io/is-my-pods-worth-it/

![Is my Pods Worth It?](og-image.png)

Apple の「Liquid Glass」グラスモーフィズム UI で作られた純粋なフロントエンドの静的サイトです。iPhone の「ヘルスケア」App から書き出した `export.zip`（または `export.xml`）をドラッグ＆ドロップするだけで、自動的に：

- 各 `HeadphoneAudioExposure`（ヘッドホン音量）レコードからハードウェアのモデル ID とデバイス名を抽出
- モデルごとにグループ化して計算：
  - 総リスニング時間
  - 時間加重平均音量
  - 最大記録音量
  - 使用期間
  - サンプル記録数
  - **参考価格（RRP）**
  - **1時間あたりのリスニングコスト**
  - **CP スコア（0〜100）**

## 特徴

- 🔒 **100% ローカル**：解析はすべてブラウザ内で完結。データは**一切アップロードされず**、オフラインでも動作
- 🎧 **モデル別識別**：Apple ヘッドホンのモデル対応表を内蔵（AirPods 1/2/3/4/5、AirPods Pro 1/2/3、AirPods Max 1/2）。AirPods Pro の世代（Lightning／USB-C）も判別可能。**Sony XM シリーズ**（WH-1000XM オーバーイヤー、WF-1000XM 完全ワイヤレス）にも対応
- 🔢 **hex モデル ID 対応**：一部の iOS バージョンでは Apple の Bluetooth Product ID で表示されるため（例：`0x200E`＝AirPods Pro 1、`0x2014`＝AirPods Pro 2）、対応表を内蔵。有線 EarPods も自動で表示
- 🌐 **6言語**：繁体中文（香港／台湾）、簡体中文、English、日本語、한국어 をワンクリックで切り替え。ブラウザ言語を自動検出
- 🧊 **Liquid Glass UI**：Tailwind CSS + グラスモーフィズム（backdrop-blur、スペキュラーハイライト）
- 💰 **CP スコア**：参考価格（HK$、参考値・変更可）を内蔵し、「1時間あたりのリスニングコスト」から 0〜100 点に換算。高いほどお得
- 📊 **デバイスダッシュボード**：カードをタップすると独立した共有可能な詳細ページ（戻るボタン＋共有 URL）を表示。KPI、日別/週別/月別の使用量グラフ（音量トレンド線付き）、カレンダーヒートマップ、曜日別分布、月間合計、**Chronodex 24時間の時間帯ダイヤル**、`7日/30日/90日/1年/すべて`＋カスタム期間フィルター
- 📤 **ワンタップ共有画像**：設定ポップアップで比率（4:5／1:1／9:16）、ダーク／ライト、並び順、含めるデバイス、カスタムタイトル、時間あたりコスト表示の有無を選択。リアルタイムプレビュー後、Threads／IG へ共有または PNG をダウンロード（Canvas のみ）
- 📱 **レスポンシブ**：スマホは1カラム、PC は複数カラム
- ⚡ **ストリーミング解析**：大きなファイルはチャンク単位で処理するため、UI が固まらない

## 対応言語

| 言語 | コード |
| --- | --- |
| 繁体中文（香港） | `zh-HK` |
| 繁体中文（台湾） | `zh-TW` |
| 簡体中文 | `zh-CN` |
| English | `en` |
| 日本語 | `ja` |
| 한국어 | `ko` |

右上のドロップダウンからいつでも切り替え可能。選択は保存され、初回訪問時はブラウザ言語を自動検出します。

## 対応デバイス

- **Apple**
  - AirPods（第1〜5世代、ANC およびワイヤレス充電モデルを含む）
  - AirPods Pro（第1〜3世代、Lightning および USB-C）
  - AirPods Max（第1世代 Lightning／USB-C、および Max 2）
  - EarPods（有線）
- **Sony**
  - WH-1000XM3 / XM4 / XM5 / XM6（オーバーイヤー）
  - WF-1000XM3 / XM4 / XM5（完全ワイヤレス）
- 不明なデバイスやその他の Bluetooth／有線デバイスは自動でグループ化して表示されます。

## 使い方

1. iPhone で「ヘルスケア」App を開く → 右上のプロフィール写真 → **すべての健康データを書き出す**
2. 書き出した `export.zip` をサイトにドラッグ＆ドロップ（または `export.xml` を選択）
3. すぐにモデル別の統計が表示されます

> 手順を忘れたら、アップロードエリア右上の **?** ボタンをタップ。選択中の言語でステップごとのガイドが表示されます。

## プロジェクト構成

| ファイル | 役割 |
| --- | --- |
| `index.html` | HTML マークアップのみ |
| `styles.css` | カスタムスタイル（ガラス UI、グラフ、アニメーション） |
| `app.js` | 解析、i18n、グラフ、共有画像 |
| `devices.js` | **対応デバイス情報**：モデル名＋参考価格。モデル追加や価格変更はこのファイル |

デバイスを追加するには `devices.js` を開き、Apple は `MODEL_MAP` と `PRICE_APPLE`、Sony は `PRICE_SONY` に 1 行追加します。繁体字（台湾／中国）、日本語、韓国語の名称は `zh-HK`／`en` から自動生成されます。

## 技術スタック

- [Tailwind CSS](https://tailwindcss.com/)（Play CDN、ビルド不要）
- [fflate](https://github.com/101arrowz/fflate)（ZIP 解凍）
- Google Fonts — Noto Sans TC / SC / JP / KR
- 純粋な HTML + Vanilla JS、バックエンドなし

## GitHub Pages へのデプロイ

1. この repo を GitHub に push
2. **Settings → Pages** を開く
3. 「Build and deployment」で：
   - **Source**：`Deploy from a branch`
   - **Branch**：`master`／`(root)`
4. 保存すると数分以内に `https://<username>.github.io/is-my-pods-worth-it/` が公開されます

## ローカルプレビュー

`index.html` を直接開くだけです（`fflate` と Tailwind は CDN から一度読み込むためネット接続が必要。解析自体は完全にオフラインで動作）。
