// ============================================================================
// 支援裝置資料（SUPPORTED DEVICES INFO）
// ----------------------------------------------------------------------------
// 呢個檔案集中管理「型號 → 名稱 → 建議零售價」，方便日後更新支援裝置。
//
// ① 新增 Apple 型號：
//    1) 喺 MODEL_MAP 加一行（key 用大寫型號，例如 'A9999'）：
//         'A9999': { 'zh-HK': 'AirPods X（第 1 代）', en: 'AirPods X (1st generation)' },
//    2) 喺 PRICE_APPLE 加對應價錢（HK$）；未知價錢用 null：
//         'A9999': 1899,
//    ※ zh-TW／zh-CN／ja／ko 會由 app.js 自動根據 zh-HK／en 轉換。
//
// ② 新增 Sony 型號：
//    只需喺 PRICE_SONY 加一行，例如：
//         'Sony WH-1000XM6': 3190,
//    Sony 型號會由 app.js 自動由裝置名稱偵測 WH/WF-1000XM 數字。
//
// ③ 修改價錢：直接改 PRICE_APPLE／PRICE_SONY 嘅數字（HK$，null = 未提供）。
//    CP 值評分會自動用新價錢重新計算。
// ============================================================================

// Apple 常見耳機硬件 Model 編號對照表（繁中 + English）
const MODEL_MAP = {
  // AirPods（第 1 代）
  'A1523': { 'zh-HK': 'AirPods（第 1 代）', en: 'AirPods (1st generation)' },
  'A1722': { 'zh-HK': 'AirPods（第 1 代）', en: 'AirPods (1st generation)' },
  // AirPods（第 2 代）
  'A2031': { 'zh-HK': 'AirPods（第 2 代）', en: 'AirPods (2nd generation)' },
  'A2032': { 'zh-HK': 'AirPods（第 2 代）', en: 'AirPods (2nd generation)' },
  // AirPods（第 3 代）
  'A2564': { 'zh-HK': 'AirPods（第 3 代）', en: 'AirPods (3rd generation)' },
  'A2565': { 'zh-HK': 'AirPods（第 3 代）', en: 'AirPods (3rd generation)' },
  // AirPods 4
  'A3050': { 'zh-HK': 'AirPods 4', en: 'AirPods 4' },
  'A3053': { 'zh-HK': 'AirPods 4', en: 'AirPods 4' },
  'A3054': { 'zh-HK': 'AirPods 4', en: 'AirPods 4' },
  // AirPods 4（主動消噪版）
  'A3055': { 'zh-HK': 'AirPods 4（主動消噪版）', en: 'AirPods 4 (ANC)' },
  'A3056': { 'zh-HK': 'AirPods 4（主動消噪版）', en: 'AirPods 4 (ANC)' },
  'A3057': { 'zh-HK': 'AirPods 4（主動消噪版）', en: 'AirPods 4 (ANC)' },
  // AirPods 5
  'A3531': { 'zh-HK': 'AirPods 5', en: 'AirPods 5' },
  'A3532': { 'zh-HK': 'AirPods 5', en: 'AirPods 5' },
  'A3533': { 'zh-HK': 'AirPods 5', en: 'AirPods 5' },
  // AirPods 5（無線充電版）
  'A3439': { 'zh-HK': 'AirPods 5（無線充電版）', en: 'AirPods 5 (Wireless Charging)' },
  'A3440': { 'zh-HK': 'AirPods 5（無線充電版）', en: 'AirPods 5 (Wireless Charging)' },
  'A3441': { 'zh-HK': 'AirPods 5（無線充電版）', en: 'AirPods 5 (Wireless Charging)' },
  // AirPods Pro（第 1 代）
  'A2083': { 'zh-HK': 'AirPods Pro（第 1 代）', en: 'AirPods Pro (1st generation)' },
  'A2084': { 'zh-HK': 'AirPods Pro（第 1 代）', en: 'AirPods Pro (1st generation)' },
  // AirPods Pro（第 2 代 · Lightning）
  'A2698': { 'zh-HK': 'AirPods Pro（第 2 代 · Lightning）', en: 'AirPods Pro (2nd generation · Lightning)' },
  'A2699': { 'zh-HK': 'AirPods Pro（第 2 代 · Lightning）', en: 'AirPods Pro (2nd generation · Lightning)' },
  'A2931': { 'zh-HK': 'AirPods Pro（第 2 代 · Lightning）', en: 'AirPods Pro (2nd generation · Lightning)' },
  // AirPods Pro（第 2 代 · USB-C）
  'A3047': { 'zh-HK': 'AirPods Pro（第 2 代 · USB-C）', en: 'AirPods Pro (2nd generation · USB-C)' },
  'A3048': { 'zh-HK': 'AirPods Pro（第 2 代 · USB-C）', en: 'AirPods Pro (2nd generation · USB-C)' },
  'A3049': { 'zh-HK': 'AirPods Pro（第 2 代 · USB-C）', en: 'AirPods Pro (2nd generation · USB-C)' },
  // AirPods Pro（第 3 代）
  'A3063': { 'zh-HK': 'AirPods Pro（第 3 代）', en: 'AirPods Pro (3rd generation)' },
  'A3064': { 'zh-HK': 'AirPods Pro（第 3 代）', en: 'AirPods Pro (3rd generation)' },
  'A3065': { 'zh-HK': 'AirPods Pro（第 3 代）', en: 'AirPods Pro (3rd generation)' },
  // AirPods Max（第 1 代）
  'A2096': { 'zh-HK': 'AirPods Max（第 1 代 · Lightning）', en: 'AirPods Max (1st generation · Lightning)' },
  'A3184': { 'zh-HK': 'AirPods Max（第 1 代 · USB-C）', en: 'AirPods Max (1st generation · USB-C)' },
  // AirPods Max 2
  'A3454': { 'zh-HK': 'AirPods Max 2', en: 'AirPods Max 2' },
  // Apple 藍牙 Product ID（部分 iOS 版本以 hex 顯示）
  '0X2002': { 'zh-HK': 'AirPods（第 1 代）', en: 'AirPods (1st generation)' },
  '0X200F': { 'zh-HK': 'AirPods（第 2 代）', en: 'AirPods (2nd generation)' },
  '0X2013': { 'zh-HK': 'AirPods（第 3 代）', en: 'AirPods (3rd generation)' },
  '0X201B': { 'zh-HK': 'AirPods 4（主動消噪版）', en: 'AirPods 4 (ANC)' },
  '0X200E': { 'zh-HK': 'AirPods Pro（第 1 代）', en: 'AirPods Pro (1st generation)' },
  '0X2014': { 'zh-HK': 'AirPods Pro（第 2 代 · Lightning）', en: 'AirPods Pro (2nd generation · Lightning)' },
  '0X2024': { 'zh-HK': 'AirPods Pro（第 2 代 · USB-C）', en: 'AirPods Pro (2nd generation · USB-C)' },
  '0X202B': { 'zh-HK': 'AirPods Pro（第 3 代）', en: 'AirPods Pro (3rd generation)' },
  '0X202C': { 'zh-HK': 'AirPods Pro（第 3 代）', en: 'AirPods Pro (3rd generation)' },
  '0X200A': { 'zh-HK': 'AirPods Max（第 1 代 · Lightning）', en: 'AirPods Max (1st generation · Lightning)' },
  '0X201F': { 'zh-HK': 'AirPods Max（第 1 代 · USB-C）', en: 'AirPods Max (1st generation · USB-C)' },
  '0X202D': { 'zh-HK': 'AirPods Max 2', en: 'AirPods Max 2' }
};

// 建議零售價 RRP（HK$，參考值，可自行調整）
const PRICE_APPLE = {
  'A1523': 1288, 'A1722': 1288,
  'A2031': 1288, 'A2032': 1288,
  'A2564': 1499, 'A2565': 1499,
  'A3050': 1199, 'A3053': 1199, 'A3054': 1199,
  'A3055': 1499, 'A3056': 1499, 'A3057': 1499,
  'A2083': 1999, 'A2084': 1999,
  'A2698': 1899, 'A2699': 1899, 'A2931': 1899,
  'A3047': 1899, 'A3048': 1899, 'A3049': 1899,
  'A3063': 1999, 'A3064': 1999, 'A3065': 1999,
  'A2096': 4599, 'A3184': 4599,
  'A3454': null,
  'A3531': null, 'A3532': null, 'A3533': null,
  'A3439': null, 'A3440': null, 'A3441': null,
  // Apple 藍牙 Product ID（hex）
  '0X2002': 1288, '0X200F': 1288, '0X2013': 1499, '0X201B': 1499,
  '0X200E': 1999, '0X2014': 1899, '0X2024': 1899, '0X202B': 1999, '0X202C': 1999,
  '0X200A': 4599, '0X201F': 4599, '0X202D': null
};
const PRICE_SONY = {
  'Sony WH-1000XM3': 2890,
  'Sony WH-1000XM4': 2890,
  'Sony WH-1000XM5': 3190,
  'Sony WH-1000XM6': null,
  'Sony WF-1000XM3': 1890,
  'Sony WF-1000XM4': 2090,
  'Sony WF-1000XM5': 2290
};
