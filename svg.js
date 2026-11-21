// ============================================================================
// SVG 定義與裝置插圖
// ----------------------------------------------------------------------------
// 上半部：gradients / filters / symbol groups，啟動時注入 DOM，
//         令各插圖嘅 <use href="#..."> 同 url(#...) 可以正常引用。
// 下半部：ILLUSTRATIONS — 各耳機型號嘅插圖 SVG。
// ============================================================================

// 將 SVG defs 注入 DOM（只做一次）
(function () {
  var defs = `<svg width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="apWhite" gradientUnits="userSpaceOnUse" x1="0" y1="8" x2="0" y2="90">
        <stop offset="0" stop-color="#ffffff"/>
        <stop offset="0.5" stop-color="#eef3f9"/>
        <stop offset="1" stop-color="#c3d1e2"/>
      </linearGradient>
      <linearGradient id="apBud" gradientUnits="userSpaceOnUse" x1="26" y1="18" x2="58" y2="86">
        <stop offset="0" stop-color="#ffffff"/>
        <stop offset="0.5" stop-color="#eef3f9"/>
        <stop offset="1" stop-color="#c4d0e0"/>
      </linearGradient>
      <radialGradient id="apSpec" gradientUnits="userSpaceOnUse" cx="34" cy="27" r="16">
        <stop offset="0" stop-color="#ffffff" stop-opacity="0.95"/>
        <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="apTipGrad" gradientUnits="userSpaceOnUse" x1="0" y1="8" x2="0" y2="60">
        <stop offset="0" stop-color="#ffffff"/>
        <stop offset="1" stop-color="#d8e2ee"/>
      </linearGradient>
      <linearGradient id="apMaxBody" gradientUnits="userSpaceOnUse" x1="0" y1="30" x2="0" y2="94">
        <stop offset="0" stop-color="#f7f1e6"/>
        <stop offset="0.55" stop-color="#e5dbca"/>
        <stop offset="1" stop-color="#b6a27f"/>
      </linearGradient>
      <linearGradient id="apMaxMesh" gradientUnits="userSpaceOnUse" x1="0" y1="40" x2="0" y2="94">
        <stop offset="0" stop-color="#f8f3ea"/>
        <stop offset="1" stop-color="#dccdb7"/>
      </linearGradient>
      <linearGradient id="apMaxBand" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#eae0cf"/>
        <stop offset="0.5" stop-color="#dccfb9"/>
        <stop offset="1" stop-color="#c2b092"/>
      </linearGradient>
      <linearGradient id="apSilver" gradientUnits="userSpaceOnUse" x1="0" y1="42" x2="0" y2="56">
        <stop offset="0" stop-color="#ffffff"/>
        <stop offset="1" stop-color="#96a3b5"/>
      </linearGradient>
      <pattern id="apMeshDots" width="3.2" height="3.2" patternUnits="userSpaceOnUse">
        <circle cx="1" cy="1" r="0.7" fill="#ffffff" opacity="0.55"/>
      </pattern>
      <pattern id="apMaxDots" width="3" height="3" patternUnits="userSpaceOnUse">
        <circle cx="1" cy="1" r="0.7" fill="#a99a80" opacity="0.5"/>
      </pattern>
      <filter id="apShadow" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="3" stdDeviation="2.4" flood-color="#020617" flood-opacity="0.55"/>
      </filter>

      <!-- 單耳 AirPods（普通） -->
      <g id="apRegBud">
        <path d="M40 17C49 17 56 22 56.5 31C57 39 53.5 45 48.5 47.5C47 48.2 46.5 49.1 46.5 51L46.5 82C46.5 86.5 43.5 88.5 40 88.5C36.5 88.5 33.5 86.5 33.5 82L33.5 51C33.5 49.1 33 48.2 31.5 47.5C26.5 45 23 39 23.5 31C24 22 31 17 40 17Z" fill="url(#apBud)"/>
        <ellipse cx="34" cy="29" rx="6.5" ry="5" fill="url(#apSpec)"/>
        <ellipse cx="48.6" cy="37" rx="2" ry="5" fill="#334155" opacity="0.7"/>
        <ellipse cx="40" cy="84.5" rx="2.4" ry="1.6" fill="#334155" opacity="0.6"/>
      </g>

      <!-- 單耳 AirPods Pro（矽膠耳塞 + 短柄） -->
      <g id="apProBud">
        <path d="M40 16C50 16 57 22 57 32C57 40 53 46 48 48.5C46.8 49.1 46.3 49.9 46.3 51.5L46.3 70C46.3 74.5 43.3 76.5 40 76.5C36.7 76.5 33.7 74.5 33.7 70L33.7 51.5C33.7 49.9 33.2 49.1 32 48.5C27 46 23 40 23 32C23 22 30 16 40 16Z" fill="url(#apBud)"/>
        <ellipse cx="34" cy="28" rx="6.5" ry="5" fill="url(#apSpec)"/>
        <path d="M30 23.5C34 19.5 46 19.5 50 23.5" stroke="#aebccd" stroke-width="1.1" fill="none" opacity="0.9"/>
        <ellipse cx="49" cy="36" rx="2" ry="4.8" fill="#334155" opacity="0.7"/>
        <ellipse cx="40" cy="73" rx="2.4" ry="1.6" fill="#334155" opacity="0.6"/>
      </g>

      <g id="apRegPair">
        <g transform="translate(-6 -3)"><use href="#apRegBud"/></g>
        <g transform="translate(96 0) scale(-1 1) translate(-4 3)"><use href="#apRegBud"/></g>
      </g>
      <g id="apProPair">
        <g transform="translate(-6 -3)"><use href="#apProBud"/></g>
        <g transform="translate(96 0) scale(-1 1) translate(-4 3)"><use href="#apProBud"/></g>
      </g>

      <!-- AirPods Max 單邊耳罩（置中 0,0） -->
      <g id="apMaxCup">
        <ellipse cx="0" cy="2" rx="15" ry="20" fill="url(#apMaxBody)"/>
        <ellipse cx="0" cy="2" rx="15" ry="20" fill="none" stroke="#ffffff" stroke-opacity="0.5" stroke-width="1"/>
        <ellipse cx="0" cy="3" rx="10" ry="14.5" fill="url(#apMaxMesh)"/>
        <ellipse cx="0" cy="3" rx="10" ry="14.5" fill="url(#apMaxDots)" opacity="0.7"/>
        <ellipse cx="-4" cy="-2" rx="5.5" ry="8.5" fill="#ffffff" opacity="0.28"/>
        <circle cx="6.5" cy="-11" r="2" fill="#f5eee1" stroke="#c9b89d" stroke-width="0.7"/>
        <rect x="-2.3" y="-30" width="4.6" height="12" rx="2" fill="url(#apSilver)"/>
      </g>

      <!-- Sony 專用漸層（黑 + 銅） -->
      <radialGradient id="sonyCup" cx="0.36" cy="0.3" r="0.72">
        <stop offset="0" stop-color="#515863"/>
        <stop offset="0.55" stop-color="#22262c"/>
        <stop offset="1" stop-color="#0b0d10"/>
      </radialGradient>
      <radialGradient id="sonyBud" cx="0.36" cy="0.28" r="0.74">
        <stop offset="0" stop-color="#565d67"/>
        <stop offset="0.5" stop-color="#1b1e23"/>
        <stop offset="1" stop-color="#0a0c0f"/>
      </radialGradient>
      <linearGradient id="sonyBandG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#4a5058"/>
        <stop offset="0.5" stop-color="#23272d"/>
        <stop offset="1" stop-color="#0c0e11"/>
      </linearGradient>
      <linearGradient id="sonyCopper" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#f2cfa6"/>
        <stop offset="0.5" stop-color="#cf8b43"/>
        <stop offset="1" stop-color="#8a5a24"/>
      </linearGradient>

      <!-- Sony WH 單邊耳罩（置中 0,0） -->
      <g id="sonyWhCup">
        <rect x="-15" y="-17" width="30" height="34" rx="15" fill="url(#sonyCup)"/>
        <rect x="-15" y="-17" width="30" height="34" rx="15" fill="none" stroke="#ffffff" stroke-opacity="0.16" stroke-width="1"/>
        <circle cx="0" cy="1" r="9.5" fill="none" stroke="#000000" stroke-opacity="0.45" stroke-width="1.2"/>
        <circle cx="0" cy="1" r="5.5" fill="#0a0c10" fill-opacity="0.55"/>
        <rect x="-2.6" y="-27" width="5.2" height="11" rx="2.4" fill="url(#sonyBandG)"/>
        <circle cx="0" cy="-22" r="1.5" fill="url(#sonyCopper)"/>
        <ellipse cx="-6" cy="-9" rx="3.4" ry="7" fill="#ffffff" opacity="0.18"/>
      </g>

      <!-- Sony WF 單耳（置中 0,0） -->
      <g id="sonyWfBud">
        <ellipse cx="0" cy="0" rx="12.5" ry="14.5" fill="url(#sonyBud)"/>
        <ellipse cx="9" cy="3" rx="5.5" ry="7" fill="url(#sonyBud)"/>
        <ellipse cx="0" cy="0" rx="12.5" ry="14.5" fill="none" stroke="#ffffff" stroke-opacity="0.16" stroke-width="1"/>
        <ellipse cx="9" cy="3" rx="5.5" ry="7" fill="none" stroke="#ffffff" stroke-opacity="0.12" stroke-width="1"/>
        <ellipse cx="-4.5" cy="-6" rx="4" ry="3" fill="#ffffff" opacity="0.32"/>
        <circle cx="-3" cy="7" r="2.6" fill="url(#sonyCopper)"/>
        <circle cx="-3" cy="7" r="1.1" fill="#3a2410" opacity="0.5"/>
      </g>

      <g id="sonyWfPair">
        <g transform="translate(31 47)"><use href="#sonyWfBud"/></g>
        <g transform="translate(65 47) scale(-1 1)"><use href="#sonyWfBud"/></g>
      </g>
    </defs>
  </svg>`;
  document.body.insertAdjacentHTML('afterbegin', defs);
})();

    // 內嵌型號插圖（SVG，參照 Apple 官方產品造型，100% 離線）
    const ILLUSTRATIONS = {
      airpods: `<svg viewBox="0 0 96 96" class="h-12 w-12" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g filter="url(#apShadow)"><g transform="translate(48 48) scale(0.95) translate(-48 -48)"><use href="#apRegPair"/></g></g></svg>`,
      pro: `<svg viewBox="0 0 96 96" class="h-12 w-12" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g filter="url(#apShadow)"><g transform="translate(48 48) scale(0.95) translate(-48 -48)"><use href="#apProPair"/></g></g></svg>`,
      max: `<svg viewBox="0 0 96 96" class="h-12 w-12" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <g filter="url(#apShadow)">
          <path d="M26 56V46A22 22 0 0 1 70 46V56" fill="none" stroke="url(#apMaxBand)" stroke-width="10" stroke-linecap="round"/>
          <path d="M26 52V46A22 22 0 0 1 70 46V52" fill="none" stroke="url(#apMaxMesh)" stroke-width="5" stroke-linecap="round" opacity="0.95"/>
          <path d="M28 49V46A20 20 0 0 1 68 46V49" fill="none" stroke="#ffffff" stroke-opacity="0.25" stroke-width="1.2" stroke-linecap="round"/>
          <rect x="23.3" y="38" width="5.4" height="18" rx="2.6" fill="url(#apSilver)"/>
          <rect x="24.2" y="39" width="1.2" height="14" rx="0.6" fill="#ffffff" opacity="0.55"/>
          <rect x="10" y="55.5" width="32" height="33" rx="11" fill="url(#apMaxBody)" stroke="#a8946f" stroke-opacity="0.5" stroke-width="1"/>
          <rect x="13.5" y="59" width="25" height="26" rx="9" fill="none" stroke="#cdbfa6" stroke-opacity="0.7" stroke-width="0.8"/>
          <rect x="14" y="59.5" width="24" height="25" rx="8.5" fill="url(#apMaxMesh)"/>
          <rect x="14" y="59.5" width="24" height="25" rx="8.5" fill="url(#apMaxDots)" opacity="0.7"/>
          <ellipse cx="18.5" cy="66" rx="4.5" ry="7" fill="#ffffff" opacity="0.32"/>
          <rect x="67.3" y="38" width="5.4" height="18" rx="2.6" fill="url(#apSilver)"/>
          <rect x="68.2" y="39" width="1.2" height="14" rx="0.6" fill="#ffffff" opacity="0.55"/>
          <rect x="54" y="55.5" width="32" height="33" rx="11" fill="url(#apMaxBody)" stroke="#a8946f" stroke-opacity="0.5" stroke-width="1"/>
          <rect x="57.5" y="59" width="25" height="26" rx="9" fill="none" stroke="#cdbfa6" stroke-opacity="0.7" stroke-width="0.8"/>
          <rect x="58" y="59.5" width="24" height="25" rx="8.5" fill="url(#apMaxMesh)"/>
          <rect x="58" y="59.5" width="24" height="25" rx="8.5" fill="url(#apMaxDots)" opacity="0.7"/>
          <ellipse cx="77.5" cy="66" rx="4.5" ry="7" fill="#ffffff" opacity="0.32"/>
          <rect x="74" y="60.5" width="4" height="1.6" rx="0.8" fill="#cabfa9" stroke="#b6a27f" stroke-width="0.5"/>
          <circle cx="80" cy="63" r="2.6" fill="url(#apSilver)" stroke="#8a97a6" stroke-width="0.6"/>
          <line x1="78.7" y1="61.4" x2="78.7" y2="64.6" stroke="#8a97a6" stroke-width="0.6" stroke-linecap="round"/>
        </g>
      </svg>`,
      'sony-wh': `<svg viewBox="0 0 96 96" class="h-12 w-12" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g filter="url(#apShadow)"><path d="M26 56V46A22 22 0 0 1 70 46V56" fill="none" stroke="url(#sonyBandG)" stroke-width="11" stroke-linecap="round"/><path d="M26 52V46A22 22 0 0 1 70 46V52" fill="none" stroke="#ffffff" stroke-opacity="0.16" stroke-width="3" stroke-linecap="round"/><use href="#sonyWhCup" transform="translate(26 70)"/><use href="#sonyWhCup" transform="translate(70 70)"/></g></svg>`,
      'sony-wf': `<svg viewBox="0 0 96 96" class="h-12 w-12" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g filter="url(#apShadow)"><use href="#sonyWfPair"/></g></svg>`
    };
