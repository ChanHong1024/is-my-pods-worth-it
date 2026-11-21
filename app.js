// 語言字典已移到 i18n.js（STRINGS）

const LANGS = ['zh-HK', 'zh-TW', 'zh-CN', 'en', 'ja', 'ko'];

    let currentLang = detectLang();

    function detectLang() {
      const stored = localStorage.getItem('lang');
      if (LANGS.includes(stored)) return stored;
      const nav = (navigator.language || 'en').toLowerCase();
      if (nav.startsWith('ja')) return 'ja';
      if (nav.startsWith('ko')) return 'ko';
      if (nav.startsWith('zh')) {
        if (nav.includes('tw') || nav.includes('hant')) return 'zh-TW';
        if (nav.includes('hk') || nav.includes('mo')) return 'zh-HK';
        if (nav.includes('cn') || nav.includes('sg') || nav.includes('hans')) return 'zh-CN';
        return 'zh-TW';
      }
      return 'en';
    }

    function t(key, vars) {
      let s = (STRINGS[currentLang] && STRINGS[currentLang][key]) || STRINGS.en[key] || key;
      if (vars) {
        for (const k in vars) s = s.replace('{' + k + '}', vars[k]);
      }
      return s;
    }

    // 裝置型號／名稱／價格資料已獨立到 devices.js（方便更新支援裝置）
    // （MODEL_MAP、PRICE_APPLE、PRICE_SONY 均由 devices.js 定義）

    // CP 值評分：以「每小時成本」映射到 0–100（MID＝每隔多少錢一小時得 50 分）
    const CP_MID = 5;

    function priceFor(info) {
      if (info.sony) return Object.prototype.hasOwnProperty.call(PRICE_SONY, info.sony.model) ? PRICE_SONY[info.sony.model] : null;
      if (info.modelKey && Object.prototype.hasOwnProperty.call(PRICE_APPLE, info.modelKey)) return PRICE_APPLE[info.modelKey];
      if (/earpods/i.test(info.displayName || '')) return 149;
      return null;
    }

    function cpScoreFor(price, hours) {
      if (price == null || !(hours > 0)) return null;
      const costPerHour = price / hours;
      const score = Math.round(100 * CP_MID / (CP_MID + costPerHour));
      return Math.max(0, Math.min(100, score));
    }

    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const statusEl = document.getElementById('status');
    const resultsEl = document.getElementById('results');
    const chooseBtn = document.getElementById('chooseBtn');
    const langSelect = document.getElementById('langSelect');

    let lastDeviceStats = null;
    let lastStatus = null;
    let lastShareData = null;

    function setStatus(key, vars) {
      lastStatus = { key, vars };
      statusEl.textContent = t(key, vars);
    }

    function applyStaticTexts() {
      document.documentElement.lang = currentLang;
      document.title = t('title');
      document.querySelectorAll('[data-i18n]').forEach((el) => {
        el.textContent = t(el.getAttribute('data-i18n'));
      });
      document.querySelectorAll('[data-i18n-html]').forEach((el) => {
        el.innerHTML = t(el.getAttribute('data-i18n-html'));
      });
      if (lastStatus) setStatus(lastStatus.key, lastStatus.vars);
      updateLangToggle();
    }

    function updateLangToggle() {
      if (langSelect) langSelect.value = currentLang;
    }

    function setLang(lang) {
      if (currentLang === lang) return;
      currentLang = lang;
      localStorage.setItem('lang', lang);
      applyStaticTexts();
      if (lastDeviceStats) renderResults(lastDeviceStats);
      const modalEl = document.getElementById('shareModal');
      if (modalEl && !modalEl.classList.contains('hidden')) {
        buildDeviceList();
        updateSharePreview();
      }
      const dv = document.getElementById('detailView');
      if (dv && !dv.hidden) handleRoute();
    }

    if (langSelect) langSelect.addEventListener('change', () => setLang(langSelect.value));

    chooseBtn.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('dragover');
    });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length) handleFile(e.target.files[0]);
    });

    // Sony XM 系列偵測（WH-1000XM 頭戴 / WF-1000XM 真無線）
    function detectSony(modelCode, devName, mfg) {
      const s = (modelCode + ' ' + devName + ' ' + mfg).toUpperCase();
      const over = /\bWH-?\s?1000\s?XM\s?(\d)\b/.exec(s);
      if (over) return { label: 'Sony WH-1000XM' + over[1], model: 'Sony WH-1000XM' + over[1], family: 'sony-wh' };
      const ear = /\bWF-?\s?1000\s?XM\s?(\d)\b/.exec(s);
      if (ear) return { label: 'Sony WF-1000XM' + ear[1], model: 'Sony WF-1000XM' + ear[1], family: 'sony-wf' };
      // 只有「1000XM4」字樣（無 WH/WF 前綴）→ 當頭戴
      const any = /\b1000\s?XM\s?(\d)\b/.exec(s);
      if (any) return { label: 'Sony WH-1000XM' + any[1], model: 'Sony WH-1000XM' + any[1], family: 'sony-wh' };
      return null;
    }

    // 從 device 字串提取 name、manufacturer、model
    function parseDeviceInfo(deviceAttr, fallbackSource) {
      if (!deviceAttr) {
        const sony = detectSony('', fallbackSource || '', '');
        return {
          key: sony ? (sony.model + '__' + (fallbackSource || sony.label)) : ('source:' + fallbackSource),
          displayName: fallbackSource || (sony ? sony.label : t('unknownDevice')),
          modelCode: '',
          modelKey: '',
          mfg: '',
          sony: sony
        };
      }

      // 還原 XML 轉義字元
      const decoded = deviceAttr.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

      const nameMatch = decoded.match(/name:([^,>]+)/);
      const modelMatch = decoded.match(/model:([^,>]+)/);
      const mfgMatch = decoded.match(/manufacturer:([^,>]+)/);

      const devName = nameMatch ? nameMatch[1].trim() : '';
      const modelCode = modelMatch ? modelMatch[1].trim() : '';
      const mfg = mfgMatch ? mfgMatch[1].trim() : '';
      const modelKey = modelCode ? modelCode.toUpperCase() : '';

      const sony = detectSony(modelCode, devName, mfg);
      const displayName = devName || (sony ? sony.label : (modelCode || mfg || ''));

      // 用「正式型號（英文 canonical）+ 裝置名稱」做唯一分組 Key，避免左右耳（如 A2083/A2084）被拆成兩張卡，同時與語言無關
      const canonical = sony ? sony.model : (MODEL_MAP[modelKey] ? MODEL_MAP[modelKey].en : (modelCode || mfg || 'other'));
      const groupKey = canonical + '__' + displayName;

      return { key: groupKey, displayName, modelCode, modelKey, mfg, sony };
    }

    function zhModelVariant(text, lang) {
      if (!text) return text;
      if (lang === 'zh-TW') return text.replace(/主動消噪/g, '主動式降噪');
      if (lang === 'zh-CN') {
        const map = { '動': '动', '無': '无', '線': '线', '電': '电', '機': '机' };
        return text.replace(/主動消噪/g, '主动降噪').replace(/[動無線電機]/g, (ch) => map[ch] || ch);
      }
      return text;
    }

    function localizedModelFromEn(enLabel, lang) {
      const m = enLabel.match(/^(.*?)\s*\((.*?)\)$/);
      let base = enLabel;
      let variant = '';
      if (m) { base = m[1].trim(); variant = m[2]; }
      if (lang === 'ja') {
        variant = variant
          .replace(/(\d)(?:st|nd|rd|th) generation/g, '第$1世代')
          .replace(/\bANC\b/g, 'アクティブノイズキャンセリングモデル')
          .replace(/Wireless Charging/g, 'ワイヤレス充電対応');
      } else if (lang === 'ko') {
        variant = variant
          .replace(/(\d)(?:st|nd|rd|th) generation/g, '$1세대')
          .replace(/\bANC\b/g, '액티브 노이즈 캔슬링')
          .replace(/Wireless Charging/g, '무선 충전');
      }
      return variant ? `${base}（${variant}）` : base;
    }

    function modelFullLabel(modelKey) {
      const entry = MODEL_MAP[modelKey];
      if (!entry) return null;
      if (currentLang === 'zh-TW' || currentLang === 'zh-CN') return zhModelVariant(entry['zh-HK'], currentLang);
      if (currentLang === 'ja' || currentLang === 'ko') return localizedModelFromEn(entry.en, currentLang);
      return entry[currentLang] || entry.en;
    }

    function modelLabelFor(info) {
      if (info.sony) return info.sony.label;
      if (info.modelCode) {
        const known = info.modelKey && MODEL_MAP[info.modelKey];
        if (!known) return t('modelPrefix', { code: info.modelCode });
        const full = modelFullLabel(info.modelKey);
        // 拆出「產品名 + 括號變體」，例如 "AirPods Pro（第 2 代 · Lightning）"
        const m = full.match(/^(.*?)[（(](.+?)[）)]$/);
        if (m) {
          const base = m[1].trim();
          const variant = m[2].trim();
          const title = (info.displayName || '').toLowerCase();
          // 標題已含產品名 → 只顯示變體（第幾代／Lightning 等）；否則保留完整型號
          return (title && title.includes(base.toLowerCase())) ? variant : full;
        }
        return full;
      }
      if (/earpods/i.test(info.displayName || '')) return 'Apple EarPods';
      if (info.mfg) return info.mfg;
      return t('otherDevice');
    }

    function displayNameFor(info) {
      if (info.displayName) return info.displayName;
      if (info.sony) return info.sony.label;
      if (info.modelKey && MODEL_MAP[info.modelKey]) return modelFullLabel(info.modelKey);
      if (info.modelCode) return t('modelPrefix', { code: info.modelCode });
      return t('otherDevice');
    }

    // 裝置插圖（SVG）已移到 svg.js

function familyFor(info) {
      if (info.sony) return info.sony.family;
      if (info.modelKey && MODEL_MAP[info.modelKey]) {
        const en = MODEL_MAP[info.modelKey].en;
        if (/Max/i.test(en)) return 'max';
        if (/Pro/i.test(en)) return 'pro';
      }
      // 型號對照表搵唔到時，靠裝置名稱判斷（例如被改名嘅「AirPods Max」）
      const label = (info.displayName || '') + ' ' + (info.modelCode || '');
      if (/airpods?\s*max/i.test(label)) return 'max';
      if (/airpods?\s*pro/i.test(label)) return 'pro';
      return 'airpods';
    }

    async function handleFile(file) {
      if (/^#\/device\//.test(location.hash)) location.hash = '';
      resultsEl.innerHTML = '';
      lastDeviceStats = null;
      lastShareData = null;
      const shareWrapEl = document.getElementById('shareWrap');
      if (shareWrapEl) { shareWrapEl.classList.add('hidden'); shareWrapEl.classList.remove('flex'); }
      const noteHide = document.getElementById('priceNote');
      if (noteHide) noteHide.classList.add('hidden');
      setStatus('statusPreparing', { name: file.name, size: (file.size / 1024 / 1024).toFixed(1) });

      const deviceStats = new Map();
      let leftover = '';
      const decoder = new TextDecoder('utf-8');

      const recordRegex = /<Record\b[^>]*type="HKQuantityTypeIdentifierHeadphoneAudioExposure"[^>]*\/?>/g;
      const attrRegex = /(\w+)="([^"]*)"/g;

      function processChunk(textChunk) {
        const content = leftover + textChunk;
        const lastCloseIdx = content.lastIndexOf('>');
        if (lastCloseIdx === -1) {
          leftover = content;
          return;
        }
        const processable = content.slice(0, lastCloseIdx + 1);
        leftover = content.slice(lastCloseIdx + 1);

        let match;
        recordRegex.lastIndex = 0;
        while ((match = recordRegex.exec(processable)) !== null) {
          const tag = match[0];
          const attrs = {};
          let attrMatch;
          attrRegex.lastIndex = 0;
          while ((attrMatch = attrRegex.exec(tag)) !== null) {
            attrs[attrMatch[1]] = attrMatch[2];
          }

          const val = parseFloat(attrs.value);
          const start = parseAppleDate(attrs.startDate);
          const end = parseAppleDate(attrs.endDate);

          if (!isNaN(val) && !isNaN(start) && !isNaN(end) && end >= start) {
            const durationSec = (end - start) / 1000;
            const info = parseDeviceInfo(attrs.device, attrs.sourceName);

            if (!deviceStats.has(info.key)) {
              deviceStats.set(info.key, {
                info,
                totalSeconds: 0,
                weightedDbSum: 0,
                count: 0,
                maxDb: 0,
                firstUsed: start,
                lastUsed: end,
                daily: new Map()
              });
            }
            const stat = deviceStats.get(info.key);
            stat.totalSeconds += durationSec;
            stat.weightedDbSum += val * durationSec;
            stat.count += 1;
            if (val > stat.maxDb) stat.maxDb = val;
            if (start < stat.firstUsed) stat.firstUsed = start;
            if (end > stat.lastUsed) stat.lastUsed = end;

            const dayKey = (attrs.startDate || '').slice(0, 10);
            if (/^\d{4}-\d{2}-\d{2}$/.test(dayKey)) {
              let d = stat.daily.get(dayKey);
              if (!d) { d = { sec: 0, dbw: 0, count: 0, max: 0, hrs: new Array(24).fill(0) }; stat.daily.set(dayKey, d); }
              d.sec += durationSec;
              d.dbw += val * durationSec;
              d.count += 1;
              if (val > d.max) d.max = val;
              const hr = Number((attrs.startDate || '').slice(11, 13));
              if (hr >= 0 && hr < 24) d.hrs[hr] += durationSec;
            }
          }
        }
      }

      try {
        if (file.name.endsWith('.xml')) {
          await streamReadBlob(file, (chunk) => {
            processChunk(decoder.decode(chunk, { stream: true }));
          });
          processChunk(decoder.decode());
          renderResults(deviceStats);
        } else if (file.name.endsWith('.zip')) {
          let foundExportXml = false;
          const unzipper = new fflate.Unzip((zipFile) => {
            if (zipFile.name.endsWith('export.xml')) {
              foundExportXml = true;
              zipFile.ondata = (err, data, final) => {
                if (err) throw err;
                processChunk(decoder.decode(data, { stream: !final }));
              };
              zipFile.start();
            }
          });
          unzipper.register(fflate.UnzipInflate);

          await streamReadBlob(file, (chunk) => {
            unzipper.push(chunk, false);
          });
          unzipper.push(new Uint8Array(0), true);

          if (foundExportXml) {
            // 串流結束後統一 flush＋渲染，避免個別瀏覽器冇觸發 ondata final 而卡住
            processChunk(decoder.decode());
            renderResults(deviceStats);
          } else {
            setStatus('errNoXml');
          }
        } else {
          setStatus('errFileType');
        }
      } catch (err) {
        console.error(err);
        setStatus('errParse', { msg: err.message });
      }
    }

    async function streamReadBlob(blob, onChunk) {
      const CHUNK_SIZE = 4 * 1024 * 1024;
      let offset = 0;
      while (offset < blob.size) {
        const slice = blob.slice(offset, offset + CHUNK_SIZE);
        const buf = await slice.arrayBuffer();
        onChunk(new Uint8Array(buf));
        offset += CHUNK_SIZE;
        const pct = Math.min(100, Math.round((offset / blob.size) * 100));
        setStatus('statusStreaming', { pct: pct });
        await new Promise((r) => setTimeout(r, 0));
      }
    }

    // Apple 健康日期格式 "YYYY-MM-DD HH:MM:SS +0800"：Safari 用 Date.parse 會回傳 NaN，必須自行解析
    function parseAppleDate(s) {
      if (!s) return NaN;
      const str = String(s).trim();
      const m = str.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?\s*([+-])(\d{2}):?(\d{2})?$/);
      if (m) {
        const ms = m[7] ? Math.round(parseFloat('0.' + m[7]) * 1000) : 0;
        const offMin = (m[8] === '-' ? -1 : 1) * (parseInt(m[9], 10) * 60 + parseInt(m[10] || '00', 10));
        return Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6], ms) - offMin * 60000;
      }
      const m2 = str.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?$/);
      if (m2) {
        const ms = m2[7] ? Math.round(parseFloat('0.' + m2[7]) * 1000) : 0;
        return new Date(+m2[1], +m2[2] - 1, +m2[3], +m2[4], +m2[5], +m2[6], ms).getTime();
      }
      const t = Date.parse(str);
      return isNaN(t) ? NaN : t;
    }

    function formatDate(ts) {
      const d = new Date(ts);
      return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }

    function renderResults(deviceStats) {
      lastDeviceStats = deviceStats;

      if (deviceStats.size === 0) {
        setStatus('emptyRecords');
        return;
      }

      setStatus('done', { n: deviceStats.size });

      const noteEl = document.getElementById('priceNote');
      if (noteEl) noteEl.classList.remove('hidden');

      const sorted = Array.from(deviceStats.values()).sort((a, b) => b.totalSeconds - a.totalSeconds);
      resultsEl.innerHTML = '';

      lastShareData = sorted.map((stat) => {
        const hv = stat.totalSeconds / 3600;
        const price = priceFor(stat.info);
        return {
          name: displayNameFor(stat.info),
          model: modelLabelFor(stat.info),
          hours: hv,
          avgDb: stat.totalSeconds > 0 ? (stat.weightedDbSum / stat.totalSeconds).toFixed(1) : '0.0',
          price: price,
          cpScore: cpScoreFor(price, hv),
          costPerHour: (price != null && hv > 0) ? price / hv : null
        };
      });
      const shareWrapShow = document.getElementById('shareWrap');
      if (shareWrapShow) { shareWrapShow.classList.remove('hidden'); shareWrapShow.classList.add('flex'); }

      const locale = currentLang;

      for (const [idx, stat] of sorted.entries()) {
        const hours = (stat.totalSeconds / 3600).toFixed(1);
        const avgDb = stat.totalSeconds > 0 ? (stat.weightedDbSum / stat.totalSeconds).toFixed(1) : '0.0';
        const name = displayNameFor(stat.info);
        const model = modelLabelFor(stat.info);
        const hoursVal = stat.totalSeconds / 3600;
        const price = priceFor(stat.info);
        const cpScore = cpScoreFor(price, hoursVal);
        const costPerHour = (price != null && hoursVal > 0) ? price / hoursVal : null;

        const card = document.createElement('div');
        card.className = 'liquid card-in device-card rounded-3xl p-6';
        card.dataset.key = stat.info.key;
        card.style.animationDelay = (idx * 0.06).toFixed(2) + 's';
        card.innerHTML = `
          <div class="mb-4 flex items-center gap-4 border-b border-white/10 pb-4">
            <div class="illu flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-cyan-200/80 shadow-inner" style="--d:${(idx * 0.5).toFixed(2)}s">
              ${ILLUSTRATIONS[familyFor(stat.info)]}
            </div>
            <div class="min-w-0 flex-1">
              <div class="truncate text-lg font-semibold leading-snug">${escapeHtml(name)}</div>
              <div class="badge-model mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium">${escapeHtml(model)}</div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
          </div>
          <div class="space-y-2.5">
            <div class="flex items-center justify-between gap-3 text-sm">
              <span class="text-white/55">${t('totalDuration')}</span>
              <span class="font-semibold">${t('hours', { h: hours })}</span>
            </div>
            <div class="flex items-center justify-between gap-3 text-sm">
              <span class="text-white/55">${t('weightedAvg')}</span>
              <span class="font-semibold">${t('db', { x: avgDb })}</span>
            </div>
            <div class="flex items-center justify-between gap-3 text-sm">
              <span class="text-white/55">${t('maxVolume')}</span>
              <span class="font-semibold">${t('db', { x: stat.maxDb.toFixed(1) })}</span>
            </div>
            <div class="flex items-center justify-between gap-3 text-sm">
              <span class="text-white/55">${t('dateRange')}</span>
              <span class="font-semibold">${t('range', { a: formatDate(stat.firstUsed), b: formatDate(stat.lastUsed) })}</span>
            </div>
            <div class="flex items-center justify-between gap-3 text-sm">
              <span class="text-white/55">${t('sampleCount')}</span>
              <span class="font-semibold">${t('records', { n: stat.count.toLocaleString(locale) })}</span>
            </div>
          </div>
          <div class="mt-4 space-y-2.5 border-t border-white/10 pt-4">
            <div class="flex items-center justify-between gap-3 text-sm">
              <span class="text-white/55">${t('rrp')}</span>
              <span class="font-semibold">${price != null ? 'HK$' + price.toLocaleString(locale) : '—'}</span>
            </div>
            <div class="flex items-center justify-between gap-3 text-sm">
              <span class="text-white/55">${t('costPerHour')}</span>
              <span class="font-semibold">${costPerHour != null ? t('perHour', { x: 'HK$' + costPerHour.toFixed(costPerHour < 10 ? 1 : 0) }) : '—'}</span>
            </div>
            <div class="flex items-center justify-between gap-3 text-sm">
              <span class="text-white/55">${t('cpScore')}</span>
              <span class="font-semibold">${cpScore != null ? t('score', { n: cpScore }) : t('cpNA')}</span>
            </div>
            ${cpScore != null ? `<div class="h-1.5 w-full overflow-hidden rounded-full bg-white/10"><div class="h-full rounded-full" style="width:${cpScore}%;background:linear-gradient(90deg,#38bdf8,#a78bfa)"></div></div>` : ''}
          </div>
        `;
        card.addEventListener('click', () => {
          const target = '#/device/' + encodeURIComponent(stat.info.key);
          if (location.hash === target) handleRoute(); else location.hash = target;
        });
        resultsEl.appendChild(card);
      }
    }

    // ===== 詳情頁（Dashboard）=====
    function dkToUTC(k) { const p = k.split('-').map(Number); return Date.UTC(p[0], p[1] - 1, p[2]); }
    function utcToDk(ms) { const d = new Date(ms); return d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0') + '-' + String(d.getUTCDate()).padStart(2, '0'); }
    function addDaysKey(k, n) { return utcToDk(dkToUTC(k) + n * 86400000); }
    function daysBetween(a, b) { return Math.round((dkToUTC(b) - dkToUTC(a)) / 86400000) + 1; }
    function statDayRange(stat) {
      const keys = Array.from(stat.daily.keys()).sort();
      return { min: keys[0] || utcToDk(stat.firstUsed || Date.now()), max: keys[keys.length - 1] || utcToDk(stat.lastUsed || Date.now()) };
    }

    function aggregatePeriod(stat, from, to) {
      let sec = 0, dbw = 0, count = 0, max = 0, active = 0, bestKey = null, bestSec = -1;
      for (const [k, d] of stat.daily) {
        if (k < from || k > to) continue;
        sec += d.sec; dbw += d.dbw; count += d.count;
        if (d.max > max) max = d.max;
        if (d.sec > 0) { active++; if (d.sec > bestSec) { bestSec = d.sec; bestKey = k; } }
      }
      const days = daysBetween(from, to);
      const hours = sec / 3600;
      const price = priceFor(stat.info);
      return { from, to, days, activeDays: active, sec, hours, avgDb: sec > 0 ? dbw / sec : 0, maxDb: max, count, bestKey, bestSec, price, cpScore: cpScoreFor(price, hours) };
    }

    function buildBuckets(stat, from, to) {
      const span = daysBetween(from, to);
      const gran = span <= 120 ? 'day' : (span <= 720 ? 'week' : 'month');
      const buckets = [];
      if (gran === 'day') {
        for (let k = from; k <= to; k = addDaysKey(k, 1)) {
          const d = stat.daily.get(k);
          buckets.push({ label: k, start: k, end: k, sec: d ? d.sec : 0, dbw: d ? d.dbw : 0 });
        }
      } else if (gran === 'week') {
        let k = from;
        while (k <= to) {
          let end = addDaysKey(k, 6); if (end > to) end = to;
          let sec = 0, dbw = 0;
          for (let x = k; x <= end; x = addDaysKey(x, 1)) { const d = stat.daily.get(x); if (d) { sec += d.sec; dbw += d.dbw; } }
          buckets.push({ label: k, start: k, end, sec, dbw });
          k = addDaysKey(end, 1);
        }
      } else {
        const map = new Map();
        for (const [k, d] of stat.daily) {
          if (k < from || k > to) continue;
          const mk = k.slice(0, 7);
          let b = map.get(mk); if (!b) { b = { sec: 0, dbw: 0 }; map.set(mk, b); }
          b.sec += d.sec; b.dbw += d.dbw;
        }
        for (const mk of Array.from(map.keys()).sort()) { const b = map.get(mk); buckets.push({ label: mk, start: mk + '-01', end: mk, sec: b.sec, dbw: b.dbw }); }
      }
      return { gran, buckets };
    }

    function monthlyBuckets(stat, from, to) {
      const map = new Map();
      for (const [k, d] of stat.daily) {
        if (k < from || k > to) continue;
        const mk = k.slice(0, 7);
        let b = map.get(mk); if (!b) { b = { sec: 0, dbw: 0 }; map.set(mk, b); }
        b.sec += d.sec; b.dbw += d.dbw;
      }
      return Array.from(map.keys()).sort().map((mk) => { const b = map.get(mk); return { label: mk, sec: b.sec, dbw: b.dbw }; });
    }

    function weekdayBuckets(stat, from, to) {
      const sum = [0, 0, 0, 0, 0, 0, 0], cnt = [0, 0, 0, 0, 0, 0, 0];
      for (let k = from; k <= to; k = addDaysKey(k, 1)) {
        const dow = (new Date(dkToUTC(k)).getUTCDay() + 6) % 7;
        cnt[dow]++;
        const d = stat.daily.get(k); if (d) sum[dow] += d.sec;
      }
      return sum.map((s, i) => ({ dow: i, hours: cnt[i] ? s / cnt[i] / 3600 : 0 }));
    }

    function weekdayShort() {
      if (currentLang.startsWith('zh')) return ['一', '二', '三', '四', '五', '六', '日'];
      if (currentLang === 'ja') return ['月', '火', '水', '木', '金', '土', '日'];
      if (currentLang === 'ko') return ['월', '화', '수', '목', '금', '토', '일'];
      return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    }

    function hourlyBuckets(stat, from, to) {
      const arr = new Array(24).fill(0);
      for (const [k, d] of stat.daily) {
        if (k < from || k > to || !d.hrs) continue;
        for (let h = 0; h < 24; h++) arr[h] += d.hrs[h];
      }
      return arr;
    }

    function svgChronodex(hours) {
      const size = 420, cx = size / 2, cy = size / 2, rIn = 60, rOut = 178;
      const rad = Math.PI / 180;
      const maxSec = Math.max(0.0001, ...hours);
      const pt = (r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
      const sector = (ri, ro, a0, a1) => {
        const p1 = pt(ro, a0), p2 = pt(ro, a1), p3 = pt(ri, a1), p4 = pt(ri, a0);
        return `M${p1[0].toFixed(2)} ${p1[1].toFixed(2)} A${ro} ${ro} 0 0 1 ${p2[0].toFixed(2)} ${p2[1].toFixed(2)} L${p3[0].toFixed(2)} ${p3[1].toFixed(2)} A${ri} ${ri} 0 0 0 ${p4[0].toFixed(2)} ${p4[1].toFixed(2)} Z`;
      };
      const pad2 = (n) => String(n).padStart(2, '0');
      let wedges = '';
      for (let h = 0; h < 24; h++) {
        const mid = (-90 + h * 15 + 7.5) * rad;
        const a0 = mid - 6.5 * rad, a1 = mid + 6.5 * rad;
        const sec = hours[h];
        const r = sec / maxSec;
        let fill;
        if (sec <= 0) fill = 'rgba(255,255,255,0.05)';
        else if (r > 0.75) fill = 'rgba(167,139,250,0.95)';
        else if (r > 0.5) fill = 'rgba(56,189,248,0.82)';
        else if (r > 0.25) fill = 'rgba(56,189,248,0.55)';
        else fill = 'rgba(56,189,248,0.3)';
        const tip = pad2(h) + ':00–' + pad2((h + 1) % 24) + ':00 · ' + t('hours', { h: (sec / 3600).toFixed(1) });
        wedges += `<path class="chrono-wedge" data-tip="${escapeHtml(tip)}" style="animation-delay:${h * 12}ms" d="${sector(rIn, rOut, a0, a1)}" fill="${fill}" stroke="rgba(0,0,0,0.18)" stroke-width="0.6"></path>`;
      }
      // Chronodex 螺旋線（一圈，由內到外）
      let spiral = '', steps = 260;
      for (let i = 0; i <= steps; i++) {
        const tt = i / steps;
        const a = (-90 + tt * 360) * rad;
        const rr = rIn + (rOut - rIn) * tt;
        const x = cx + rr * Math.cos(a), y = cy + rr * Math.sin(a);
        spiral += (i === 0 ? 'M' : 'L') + x.toFixed(2) + ' ' + y.toFixed(2) + ' ';
      }
      // 刻度 + 標籤
      let ticks = '';
      for (let h = 0; h < 24; h++) {
        const a = (-90 + h * 15) * rad;
        const major = h % 3 === 0;
        const r1 = rOut + (major ? 4 : 2), r2 = rOut + (major ? 11 : 6);
        const q1 = pt(r1, a), q2 = pt(r2, a);
        ticks += `<line x1="${q1[0].toFixed(1)}" y1="${q1[1].toFixed(1)}" x2="${q2[0].toFixed(1)}" y2="${q2[1].toFixed(1)}" stroke="rgba(255,255,255,${major ? 0.5 : 0.22})" stroke-width="${major ? 1.5 : 1}"></line>`;
        if (major) {
          const rr = rOut + 25;
          const p = pt(rr, a);
          ticks += `<text x="${p[0].toFixed(1)}" y="${(p[1] + 4).toFixed(1)}" text-anchor="middle" fill="rgba(255,255,255,.5)" font-size="13">${h}</text>`;
        }
      }
      const rings = `<circle cx="${cx}" cy="${cy}" r="${rIn}" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>`
        + `<circle cx="${cx}" cy="${cy}" r="${rOut}" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>`;
      return `<svg viewBox="0 0 ${size} ${size}" class="w-full" style="max-width:250px;display:block;margin:0 auto">${rings}${wedges}<path d="${spiral}" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.1"></path>${ticks}</svg>`;
    }

    function svgBars(items, opts) {
      opts = opts || {};
      const W = opts.viewW || 1000, H = opts.viewH || (opts.showVolume ? 300 : 240);
      const padL = 12, padR = 12, padT = 18, padB = 28;
      const plotW = W - padL - padR, plotH = H - padT - padB;
      const n = items.length || 1;
      const maxH = Math.max(0.0001, ...items.map((it) => Math.max(0, it.h || 0)));
      const step = plotW / n;
      const bw = Math.max(1, Math.min(step * 0.68, opts.maxBar || 20));
      const gid = opts.gradId || 'barGrad';
      let bars = '';
      items.forEach((it, i) => {
        const h = Math.max(0, it.h || 0);
        const bh = (h / maxH) * plotH;
        const x = padL + i * step + (step - bw) / 2;
        const y = padT + plotH - bh;
        bars += `<rect class="chart-bar" data-tip="${escapeHtml(it.tip || '')}" style="animation-delay:${Math.min(i * 8, 260)}ms" x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${bw.toFixed(2)}" height="${bh > 0 ? Math.max(bh, 1.5).toFixed(2) : 0}" rx="2.5" fill="url(#${gid})"></rect>`;
      });
      let line = '';
      if (opts.showVolume) {
        const vals = items.map((it) => (it.db == null ? null : it.db));
        const nums = vals.filter((v) => v != null);
        if (nums.length) {
          const dmin = Math.min(...nums), dmax = Math.max(...nums), rng = Math.max(0.5, dmax - dmin);
          let d = '', started = false;
          items.forEach((it, i) => {
            if (it.db == null) { started = false; return; }
            const x = padL + i * step + step / 2;
            const y = padT + plotH - ((it.db - dmin) / rng) * plotH * 0.85 - plotH * 0.08;
            d += (started ? 'L' : 'M') + x.toFixed(2) + ' ' + y.toFixed(2) + ' ';
            started = true;
          });
          line = `<path class="chart-line" d="${d}" fill="none" stroke="#c4b5fd" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" opacity="0.95"></path>`;
        }
      }
      let grid = '';
      for (let g = 0; g <= 4; g++) { const y = padT + plotH * (g / 4); grid += `<line x1="${padL}" y1="${y.toFixed(1)}" x2="${W - padR}" y2="${y.toFixed(1)}" stroke="rgba(255,255,255,.06)" stroke-width="1"/>`; }
      const maxLabels = opts.maxLabels || 6;
      const count = Math.min(maxLabels, n);
      let xl = '';
      for (let j = 0; j < count; j++) {
        const i = Math.round(j * (n - 1) / Math.max(1, count - 1));
        const it = items[i]; const x = padL + i * step + step / 2;
        xl += `<text x="${x.toFixed(1)}" y="${H - 9}" fill="rgba(255,255,255,.45)" font-size="15" text-anchor="middle">${escapeHtml(it.label || '')}</text>`;
      }
      return `<svg viewBox="0 0 ${W} ${H}" class="w-full"><defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="rgba(255,255,255,0.42)"/></linearGradient></defs>${grid}${bars}${line}${xl}</svg>`;
    }

    function svgHeatmap(stat, fromKey, toKey) {
      const day = 86400000;
      const fromMs = dkToUTC(fromKey), toMs = dkToUTC(toKey);
      // 視窗擴展到覆蓋所選期間嘅整個月份，短範圍都似一個正常日曆
      const fromWindow = fromKey.slice(0, 7) + '-01';
      const ty = +toKey.slice(0, 4), tm = +toKey.slice(5, 7);
      const nextFirst = tm === 12 ? (ty + 1) + '-01-01' : ty + '-' + String(tm + 1).padStart(2, '0') + '-01';
      const toWindow = addDaysKey(nextFirst, -1);
      const winStartMs = dkToUTC(fromWindow);
      const winEndMs = dkToUTC(toWindow);
      const startMs = winStartMs - ((new Date(winStartMs).getUTCDay() + 6) % 7) * day; // 星期一
      const endMonday = winEndMs - ((new Date(winEndMs).getUTCDay() + 6) % 7) * day;
      const weeks = Math.max(1, Math.round((endMonday - startMs) / day / 7) + 1);
      const cell = weeks <= 8 ? 24 : weeks <= 20 ? 18 : 14, gap = 3, leftPad = 28, topPad = 18;
      const W = leftPad + weeks * (cell + gap), H = topPad + 7 * (cell + gap);
      let maxH = 0.0001;
      const grid = [];
      for (let w = 0; w < weeks; w++) {
        for (let d = 0; d < 7; d++) {
          const ms = startMs + (w * 7 + d) * day;
          if (ms < winStartMs || ms > winEndMs) continue;
          const k = utcToDk(ms);
          const inSel = ms >= fromMs && ms <= toMs;
          const rec = stat.daily.get(k);
          const h = rec ? rec.sec / 3600 : 0;
          if (inSel && h > maxH) maxH = h;
          grid.push({ k, h, inSel, w, d });
        }
      }
      const cells = grid.map((g) => {
        let fill;
        if (!g.inSel) fill = 'rgba(255,255,255,0.03)';
        else if (g.h > 0) {
          const r = g.h / maxH;
          fill = r > 0.75 ? '#a78bfa' : r > 0.5 ? 'rgba(56,189,248,0.78)' : r > 0.25 ? 'rgba(56,189,248,0.5)' : 'rgba(56,189,248,0.28)';
        } else fill = 'rgba(255,255,255,0.06)';
        const x = leftPad + g.w * (cell + gap), y = topPad + g.d * (cell + gap);
        const tip = g.inSel ? (g.k + ' · ' + t('hours', { h: g.h.toFixed(1) })) : g.k;
        return `<rect class="chart-cell" data-tip="${escapeHtml(tip)}" style="animation-delay:${Math.min(g.w * 6 + g.d * 2, 400)}ms" x="${x}" y="${y}" width="${cell}" height="${cell}" rx="3" fill="${fill}"></rect>`;
      }).join('');
      let monthLabels = '', prev = '', lastLabelW = -99;
      for (let w = 0; w < weeks; w++) {
        const mk = utcToDk(startMs + w * 7 * day + 3 * day).slice(0, 7);
        if (mk !== prev) {
          prev = mk;
          if (w - lastLabelW >= 3) { lastLabelW = w; const x = leftPad + w * (cell + gap); monthLabels += `<text x="${x}" y="12" fill="rgba(255,255,255,.45)" font-size="12">${mk.slice(2)}</text>`; }
        }
      }
      let wdNames;
      if (currentLang.startsWith('zh')) wdNames = ['一', '', '三', '', '五', '', ''];
      else if (currentLang === 'ja') wdNames = ['月', '', '水', '', '金', '', ''];
      else if (currentLang === 'ko') wdNames = ['월', '', '수', '', '금', '', ''];
      else wdNames = ['M', '', 'W', '', 'F', '', ''];
      let wl = '';
      for (let d = 0; d < 7; d++) { if (wdNames[d]) wl += `<text x="3" y="${topPad + d * (cell + gap) + cell - 3}" fill="rgba(255,255,255,.4)" font-size="11">${wdNames[d]}</text>`; }
      return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" style="display:block;margin:0 auto">${monthLabels}${wl}${cells}</svg>`;
    }

    function shortLabel(b, gran) {
      if (gran === 'month') return b.label.slice(2);
      return (b.label || '').slice(5);
    }

    function tipForBucket(b, gran) {
      const h = (b.sec / 3600).toFixed(1);
      const db = b.sec > 0 ? ' · ' + (b.dbw / b.sec).toFixed(1) + ' dB' : '';
      if (gran === 'week') return b.start + ' ~ ' + b.end + ' · ' + t('hours', { h }) + db;
      return b.label + ' · ' + t('hours', { h }) + db;
    }

    function wireChartTooltips(container) {
      let tip = document.getElementById('chartTip');
      if (!tip) { tip = document.createElement('div'); tip.id = 'chartTip'; tip.className = 'chart-tip hidden'; document.body.appendChild(tip); }
      const show = (e, txt) => {
        const p = e.touches ? e.touches[0] : e;
        tip.textContent = txt;
        tip.style.left = p.clientX + 'px';
        tip.style.top = p.clientY + 'px';
        tip.classList.remove('hidden');
      };
      const hide = () => { if (tip) tip.classList.add('hidden'); };
      container.addEventListener('pointermove', (e) => { const el = e.target.closest('[data-tip]'); if (el) show(e, el.getAttribute('data-tip')); else hide(); });
      container.addEventListener('pointerleave', hide);
      container.addEventListener('touchstart', (e) => { const el = e.target.closest('[data-tip]'); if (el) show(e, el.getAttribute('data-tip')); }, { passive: true });
    }

    function parseHash() {
      const h = location.hash || '';
      const m = h.match(/^#\/device\/([^?]+)(?:\?(.*))?$/);
      if (!m) return null;
      const params = new URLSearchParams(m[2] || '');
      return { key: decodeURIComponent(m[1]), from: params.get('from') || '', to: params.get('to') || '' };
    }

    function setHashDetail(key, from, to) {
      location.hash = '#/device/' + encodeURIComponent(key) + '?from=' + from + '&to=' + to;
    }

    function handleRoute() {
      const home = document.getElementById('homeView');
      const detail = document.getElementById('detailView');
      const r = parseHash();
      if (r && lastDeviceStats && lastDeviceStats.has(r.key)) {
        home.hidden = true; detail.hidden = false;
        renderDetail(r.key, r.from, r.to);
        window.scrollTo(0, 0);
      } else {
        detail.hidden = true; home.hidden = false;
        const tip = document.getElementById('chartTip'); if (tip) tip.classList.add('hidden');
      }
    }

    function kpiCard(label, value, idx) {
      return `<div class="liquid-soft kpi-in rounded-2xl px-3 py-2.5" style="animation-delay:${Math.min((idx || 0) * 35, 350)}ms"><div class="text-[11px] uppercase tracking-wide text-white/45">${escapeHtml(label)}</div><div class="mt-1 text-base font-bold sm:text-lg">${value}</div></div>`;
    }

    function renderDetail(key, from, to) {
      const stat = lastDeviceStats && lastDeviceStats.get(key);
      const el = document.getElementById('detailContent');
      if (!stat || !el) return;
      const range = statDayRange(stat);
      from = (/^\d{4}-\d{2}-\d{2}$/.test(from)) ? from : range.min;
      to = (/^\d{4}-\d{2}-\d{2}$/.test(to)) ? to : range.max;
      if (from > to) { const tmp = from; from = to; to = tmp; }

      const agg = aggregatePeriod(stat, from, to);
      const name = displayNameFor(stat.info);
      const model = modelLabelFor(stat.info);
      const icon = ILLUSTRATIONS[familyFor(stat.info)] || '';
      const { gran, buckets } = buildBuckets(stat, from, to);
      const months = monthlyBuckets(stat, from, to);
      const week = weekdayBuckets(stat, from, to);
      const locale = currentLang;

      // 「每小時成本」「CP 值評分」用全期數據，唔跟期間篩選
      const price = priceFor(stat.info);
      const totalHoursAll = stat.totalSeconds / 3600;
      const cp = cpScoreFor(price, totalHoursAll);
      const costPerHour = (price != null && totalHoursAll > 0) ? price / totalHoursAll : null;
      const perDay = agg.days > 0 ? agg.hours / agg.days : 0;

      const kpis = [
        [t('totalDuration'), t('hours', { h: agg.hours.toFixed(1) })],
        [t('perDayAvg'), t('hours', { h: perDay.toFixed(2) })],
        [t('activeDays'), t('daysCount', { n: agg.activeDays })],
        [t('bestDay'), agg.bestKey ? (agg.bestKey.slice(5) + ' · ' + (agg.bestSec / 3600).toFixed(1) + 'h') : '—'],
        [t('weightedAvg'), t('db', { x: agg.avgDb.toFixed(1) })],
        [t('maxVolume'), t('db', { x: agg.maxDb.toFixed(1) })],
        [t('sampleCount'), t('records', { n: agg.count.toLocaleString(locale) })],
        [t('rrp'), price != null ? 'HK$' + price.toLocaleString(locale) : '—'],
        [t('costPerHour'), costPerHour != null ? t('perHour', { x: 'HK$' + costPerHour.toFixed(costPerHour < 10 ? 1 : 0) }) : '—'],
        [t('cpScore'), cp != null ? t('score', { n: cp }) : t('cpNA')]
      ].map(([l, v], i) => kpiCard(l, v, i)).join('');

      const noData = agg.sec === 0;

      el.innerHTML = `
        <div class="mb-5 flex items-center gap-3">
          <button id="detailBack" class="liquid-soft flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white/70 hover:text-white" aria-label="${escapeHtml(t('back'))}">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>
          </button>
          <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-cyan-200/80 shadow-inner">${icon}</div>
          <div class="min-w-0">
            <h1 class="truncate text-xl font-bold sm:text-2xl">${escapeHtml(name)}</h1>
            <div class="badge-model mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium">${escapeHtml(model)}</div>
          </div>
        </div>

        <div class="liquid rounded-2xl p-3 sm:p-4">
          <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <span class="text-xs font-medium uppercase tracking-wide text-white/45">${escapeHtml(t('period'))}</span>
            <div id="periodGroup" class="liquid-soft flex w-full rounded-full p-1 sm:inline-flex sm:w-auto">
              <button data-days="7" class="seg-btn flex-1 rounded-full px-2 py-1.5 text-sm sm:flex-none sm:px-3">${escapeHtml(t('period7'))}</button>
              <button data-days="30" class="seg-btn flex-1 rounded-full px-2 py-1.5 text-sm sm:flex-none sm:px-3">${escapeHtml(t('period30'))}</button>
              <button data-days="90" class="seg-btn flex-1 rounded-full px-2 py-1.5 text-sm sm:flex-none sm:px-3">${escapeHtml(t('period90'))}</button>
              <button data-days="365" class="seg-btn flex-1 rounded-full px-2 py-1.5 text-sm sm:flex-none sm:px-3">${escapeHtml(t('period365'))}</button>
              <button data-days="all" class="seg-btn flex-1 rounded-full px-2 py-1.5 text-sm sm:flex-none sm:px-3">${escapeHtml(t('periodAll'))}</button>
            </div>
            <div class="flex w-full items-center gap-2 text-xs text-white/70 sm:ml-auto sm:w-auto">
              <input type="date" id="detailFrom" value="${from}" class="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-white/80 [color-scheme:dark] sm:flex-none" />
              <span>–</span>
              <input type="date" id="detailTo" value="${to}" class="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-white/80 [color-scheme:dark] sm:flex-none" />
              <button id="detailApply" class="liquid-soft shrink-0 rounded-full px-3 py-1.5 font-semibold text-white">${escapeHtml(t('apply'))}</button>
            </div>
          </div>
        </div>

        <div class="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">${kpis}</div>

        ${noData ? `<div class="mt-4 rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-sm text-white/60">${escapeHtml(t('noDataInRange'))}</div>` : `
        <div class="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div class="liquid card-in rounded-2xl p-4 lg:col-span-2" style="animation-delay:.05s">
            <div class="mb-1 flex items-center justify-between gap-2">
              <h2 class="font-semibold">${escapeHtml(t('dailyUsage'))}</h2>
              <span class="flex items-center gap-3 text-xs text-white/50">
                <span class="inline-flex items-center gap-1"><span class="inline-block h-2 w-3 rounded-sm" style="background:linear-gradient(180deg,#ffffff,rgba(255,255,255,.5))"></span>${escapeHtml(t('legendHours'))}</span>
                <span class="inline-flex items-center gap-1"><span class="inline-block h-0.5 w-3 rounded-full bg-[#c4b5fd]"></span>${escapeHtml(t('legendVolume'))}</span>
              </span>
            </div>
            <div id="chartDaily" class="chart-scroll"></div>
            <div class="mt-1 text-right text-[11px] text-white/40">${escapeHtml(t(gran === 'day' ? 'granDaily' : gran === 'week' ? 'granWeekly' : 'granMonthly'))}</div>
          </div>
          <div class="liquid card-in rounded-2xl p-4" style="animation-delay:.1s">
            <h2 class="mb-1 font-semibold">${escapeHtml(t('weekdayTitle'))}</h2>
            <div id="chartWeekday"></div>
          </div>
          <div class="liquid card-in flex flex-col rounded-2xl p-4 lg:col-span-2" style="animation-delay:.15s">
            <h2 class="mb-1 font-semibold">${escapeHtml(t('monthTitle'))}</h2>
            <div id="chartMonth" class="flex flex-1 items-center"></div>
          </div>
          <div class="liquid card-in flex flex-col rounded-2xl p-4" style="animation-delay:.18s">
            <h2 class="mb-1 font-semibold">${escapeHtml(t('hourTitle'))}</h2>
            <div id="chartClock" class="flex flex-1 items-center justify-center"></div>
          </div>
          <div class="liquid card-in rounded-2xl p-4 lg:col-span-3" style="animation-delay:.2s">
            <h2 class="mb-1 font-semibold">${escapeHtml(t('calendarTitle'))}</h2>
            <div id="chartHeatmap" class="heat-scroll"></div>
          </div>
        </div>`}
      `;

      // back / redirect
      const backBtn = document.getElementById('detailBack');
      if (backBtn) backBtn.addEventListener('click', () => { location.hash = ''; });

      // period presets
      const pGroup = document.getElementById('periodGroup');
      if (pGroup) {
        const days = daysBetween(range.min, range.max);
        const curDays = daysBetween(from, to);
        const isAll = (from === range.min && to === range.max);
        pGroup.querySelectorAll('.seg-btn').forEach((b) => {
          const d = b.getAttribute('data-days');
          const active = (d === 'all' && isAll) || (d !== 'all' && Number(d) === curDays && to === range.max);
          b.classList.toggle('active', active);
          b.addEventListener('click', () => {
            if (d === 'all') setHashDetail(key, range.min, range.max);
            else {
              const start = addDaysKey(to, -(Number(d) - 1));
              setHashDetail(key, start < range.min ? range.min : start, to);
            }
          });
        });
      }
      const applyBtn = document.getElementById('detailApply');
      if (applyBtn) applyBtn.addEventListener('click', () => {
        const f = document.getElementById('detailFrom').value;
        const t2 = document.getElementById('detailTo').value;
        if (/^\d{4}-\d{2}-\d{2}$/.test(f) && /^\d{4}-\d{2}-\d{2}$/.test(t2)) setHashDetail(key, f, t2);
      });

      if (!noData) {
        const dailyItems = buckets.map((b) => ({ h: b.sec / 3600, db: b.sec > 0 ? b.dbw / b.sec : null, label: shortLabel(b, gran), tip: tipForBucket(b, gran) }));
        const monthItems = months.map((b) => ({ h: b.sec / 3600, db: b.sec > 0 ? b.dbw / b.sec : null, label: b.label.slice(2), tip: b.label + ' · ' + t('hours', { h: (b.sec / 3600).toFixed(1) }) }));
        const wkNames = weekdayShort();
        const weekItems = week.map((w, i) => ({ h: w.hours, db: null, label: wkNames[i], tip: wkNames[i] + ' · ' + t('hours', { h: w.hours.toFixed(2) }) }));

        const cDaily = document.getElementById('chartDaily');
        if (cDaily) cDaily.innerHTML = svgBars(dailyItems, { showVolume: true, maxLabels: 6, gradId: 'gDaily' });
        const cWeek = document.getElementById('chartWeekday');
        if (cWeek) cWeek.innerHTML = svgBars(weekItems, { maxLabels: 7, gradId: 'gWeek', viewW: 520, viewH: 320, maxBar: 40 });
        const cMonth = document.getElementById('chartMonth');
        if (cMonth) cMonth.innerHTML = svgBars(monthItems, { maxLabels: 8, gradId: 'gMonth', maxBar: 40, viewH: 300 });
        const cClock = document.getElementById('chartClock');
        if (cClock) cClock.innerHTML = svgChronodex(hourlyBuckets(stat, from, to));
        const cHeat = document.getElementById('chartHeatmap');
        if (cHeat) {
          cHeat.innerHTML = svgHeatmap(stat, from, to);
          requestAnimationFrame(() => { cHeat.scrollLeft = cHeat.scrollWidth; });
        }
        wireChartTooltips(el);
      }
    }

    function escapeHtml(str) {
      return str.replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
    }

    // ===== 一鍵生成分享圖（Canvas）=====
    const SHARE_FONT = '"Noto Sans TC","Noto Sans SC","Noto Sans JP","Noto Sans KR","PingFang HK","PingFang SC","PingFang TC","Microsoft JhengHei","Segoe UI",Roboto,system-ui,sans-serif';

    function dataURLToBlob(dataUrl) {
      const parts = dataUrl.split(',');
      const mime = parts[0].match(/:(.*?);/)[1];
      const bin = atob(parts[1]);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return new Blob([bytes], { type: mime });
    }

    function downloadBlob(blob, name) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    }

    function drawShareCard(ctx, W, H, items, opts) {
      opts = opts || {};
      const dark = opts.theme !== 'light';
      const P = dark ? {
        bg1: '#0a0d14', bg2: '#0c1018',
        g1: 'rgba(56,189,248,0.30)', g2: 'rgba(139,92,246,0.30)', g3: 'rgba(236,72,153,0.22)',
        text: '#ffffff', muted: 'rgba(255,255,255,0.55)', faint: 'rgba(255,255,255,0.42)',
        kicker: 'rgba(165,243,252,0.8)', model: 'rgba(165,243,252,0.85)',
        panel: 'rgba(255,255,255,0.06)', panelStroke: 'rgba(255,255,255,0.12)', hiTop: 'rgba(255,255,255,0.12)',
        sep: 'rgba(255,255,255,0.08)', track: 'rgba(255,255,255,0.10)', best: '#7dd3fc', cp: '#ffffff'
      } : {
        bg1: '#eef2f7', bg2: '#dbe4ef',
        g1: 'rgba(56,189,248,0.24)', g2: 'rgba(139,92,246,0.20)', g3: 'rgba(244,114,182,0.16)',
        text: '#0b1220', muted: 'rgba(15,23,42,0.55)', faint: 'rgba(15,23,42,0.45)',
        kicker: 'rgba(2,132,199,0.85)', model: 'rgba(2,132,199,0.9)',
        panel: 'rgba(255,255,255,0.62)', panelStroke: 'rgba(15,23,42,0.10)', hiTop: 'rgba(255,255,255,0.7)',
        sep: 'rgba(15,23,42,0.08)', track: 'rgba(15,23,42,0.10)', best: '#0284c7', cp: '#0b1220'
      };
      const showCost = !!opts.showCost;
      const title = (opts.title && opts.title.trim()) ? opts.title.trim() : 'Is my Pods Worth It?';

      const setFont = (size, weight) => { ctx.font = `${weight || 700} ${size}px ${SHARE_FONT}`; };
      const roundRect = (x, y, w, h, r) => {
        ctx.beginPath();
        if (ctx.roundRect) { ctx.roundRect(x, y, w, h, r); return; }
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
      };
      const glow = (cx, cy, r, color) => {
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0, color);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      };
      const truncate = (text, maxWidth) => {
        if (ctx.measureText(text).width <= maxWidth) return text;
        let s = text;
        while (s.length > 1 && ctx.measureText(s + '…').width > maxWidth) s = s.slice(0, -1);
        return s + '…';
      };

      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, P.bg1);
      bg.addColorStop(1, P.bg2);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
      glow(W * 0.1, H * 0.06, 640, P.g1);
      glow(W * 0.98, H * 0.2, 560, P.g2);
      glow(W * 0.5, H * 1.02, 720, P.g3);

      const padX = 72;
      ctx.textBaseline = 'alphabetic';
      ctx.textAlign = 'left';

      setFont(76, 800);
      ctx.fillStyle = P.text;
      ctx.fillText(truncate(title, W - padX * 2), padX, 150);

      setFont(30, 500);
      ctx.fillStyle = P.muted;
      ctx.fillText(t('shareSubtitle', { n: items.length }), padX, 204);

      const px = padX, py = 296, pw = W - padX * 2, ph = H - py - 116;
      roundRect(px, py, pw, ph, 40);
      ctx.fillStyle = P.panel;
      ctx.fill();
      ctx.strokeStyle = P.panelStroke;
      ctx.lineWidth = 2;
      ctx.stroke();
      const hi = ctx.createLinearGradient(0, py, 0, py + 120);
      hi.addColorStop(0, P.hiTop);
      hi.addColorStop(1, 'rgba(255,255,255,0)');
      roundRect(px, py, pw, ph, 40);
      ctx.fillStyle = hi;
      ctx.fill();

      const inX = px + 44;
      const inR = px + pw - 44;

      if (!items.length) {
        ctx.textAlign = 'center';
        setFont(34, 600);
        ctx.fillStyle = P.muted;
        ctx.fillText(t('noDeviceSelected'), px + pw / 2, py + ph / 2);
        ctx.textAlign = 'left';
      } else {
        const listTop = py + 34;
        const avail = ph - 60;
        const n = items.length;
        const cap = n <= 2 ? 200 : n <= 4 ? 165 : n <= 6 ? 140 : 116;
        const rowH = Math.min(cap, avail / n);
        const startY = listTop + Math.max(0, (avail - rowH * n) / 2);

        let bestIdx = -1, bestCp = -1;
        items.forEach((it, i) => { if (it.cpScore != null && it.cpScore > bestCp) { bestCp = it.cpScore; bestIdx = i; } });

        const showModel = rowH >= 92;
        const showHours = rowH >= 80;
        const showBar = rowH >= 112;
        const showCostLine = showCost && rowH >= 120;
        const nameFont = rowH >= 126 ? 40 : rowH >= 96 ? 34 : 28;
        const modelFont = Math.max(18, Math.round(nameFont * 0.58));
        const costFont = Math.max(17, Math.round(nameFont * 0.55));
        const cpFont = rowH >= 126 ? 52 : rowH >= 96 ? 42 : 32;
        const smallFont = rowH >= 96 ? 23 : 19;
        const barW = inR - inX;
        const nameMaxW = barW - cpFont * 2.2 - 24;

        ctx.textBaseline = 'middle';
        items.forEach((it, i) => {
          const y0 = startY + i * rowH;
          const midY = y0 + rowH / 2;

          ctx.textAlign = 'left';
          let nameY = midY, modelY = midY, costY = midY;
          if (showModel && showCostLine) { nameY = midY - 30; modelY = midY; costY = midY + 30; }
          else if (showModel) { nameY = midY - 13; modelY = midY + 20; }

          setFont(nameFont, 800);
          ctx.fillStyle = P.text;
          ctx.fillText(truncate(it.name, nameMaxW), inX, nameY);

          if (showModel) {
            setFont(modelFont, 500);
            ctx.fillStyle = P.model;
            ctx.fillText(truncate(it.model, nameMaxW), inX, modelY);
          }
          if (showCostLine) {
            setFont(costFont, 500);
            ctx.fillStyle = P.muted;
            const costTxt = it.costPerHour != null ? t('perHour', { x: 'HK$' + it.costPerHour.toFixed(it.costPerHour < 10 ? 1 : 0) }) : '—';
            ctx.fillText(costTxt, inX, costY);
          }

          const cpY = midY - (showHours ? 11 : 0);
          ctx.textAlign = 'right';
          if (it.cpScore != null) {
            setFont(cpFont, 800);
            ctx.fillStyle = (i === bestIdx) ? P.best : P.cp;
            ctx.fillText(String(it.cpScore), inR - 44, cpY);
            setFont(Math.round(smallFont * 0.8), 600);
            ctx.fillStyle = P.muted;
            ctx.fillText('/100', inR, cpY + cpFont * 0.16);
          } else {
            setFont(Math.round(cpFont * 0.7), 700);
            ctx.fillStyle = P.muted;
            ctx.fillText('—', inR, cpY);
          }

          if (showHours) {
            setFont(smallFont, 600);
            ctx.fillStyle = P.muted;
            ctx.fillText(t('hours', { h: it.hours.toFixed(1) }), inR, midY + 21);
          }

          if (showBar) {
            const barY = y0 + rowH - 16;
            roundRect(inX, barY, barW, 8, 4);
            ctx.fillStyle = P.track; ctx.fill();
            if (it.cpScore != null) {
              const g = ctx.createLinearGradient(inX, 0, inR, 0);
              g.addColorStop(0, '#38bdf8'); g.addColorStop(1, '#a78bfa');
              roundRect(inX, barY, Math.max(8, barW * it.cpScore / 100), 8, 4);
              ctx.fillStyle = g; ctx.fill();
            }
          }

          if (i < n - 1) {
            ctx.strokeStyle = P.sep;
            ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(inX, y0 + rowH); ctx.lineTo(inR, y0 + rowH); ctx.stroke();
          }
        });
      }

      ctx.textBaseline = 'alphabetic';
      ctx.textAlign = 'center';
      setFont(23, 500);
      ctx.fillStyle = P.faint;
      ctx.fillText(t('shareFooter'), W / 2, H - 48, W - padX * 2);
      ctx.textAlign = 'left';
    }

    // ===== 分享圖設定 Popup =====
    const RATIO_DIMS = { '4:5': [1080, 1350], '1:1': [1080, 1080], '9:16': [1080, 1920] };
    const shareCfg = { ratio: '4:5', theme: 'dark', showCost: true, sort: 'time', selected: new Set(), title: 'Is my Pods Worth It?' };

    const shareModal = document.getElementById('shareModal');
    const sharePreviewImg = document.getElementById('sharePreview');
    const deviceListEl = document.getElementById('deviceList');
    const shareWarnEl = document.getElementById('shareWarn');
    const shareTitleInput = document.getElementById('shareTitleInput');
    const showCostToggle = document.getElementById('showCostToggle');
    const shareDownloadBtn = document.getElementById('shareDownload');
    const shareDoBtn = document.getElementById('shareDo');

    let previewRaf = 0;
    function schedulePreview() {
      if (previewRaf) return;
      previewRaf = requestAnimationFrame(() => { previewRaf = 0; updateSharePreview(); });
    }

    function getShareItems() {
      if (!lastShareData) return [];
      let arr = lastShareData.filter((_, i) => shareCfg.selected.has(i));
      if (shareCfg.sort === 'cp') {
        arr = arr.slice().sort((a, b) => (b.cpScore == null ? -1 : b.cpScore) - (a.cpScore == null ? -1 : a.cpScore));
      }
      return arr;
    }

    function updateSharePreview() {
      const items = getShareItems();
      const dims = RATIO_DIMS[shareCfg.ratio] || RATIO_DIMS['4:5'];
      const canvas = document.createElement('canvas');
      canvas.width = dims[0];
      canvas.height = dims[1];
      drawShareCard(canvas.getContext('2d'), dims[0], dims[1], items, {
        theme: shareCfg.theme, showCost: shareCfg.showCost, title: shareCfg.title
      });
      if (sharePreviewImg) sharePreviewImg.src = canvas.toDataURL('image/png');
      const empty = items.length === 0;
      if (shareWarnEl) shareWarnEl.classList.toggle('hidden', !empty);
      [shareDownloadBtn, shareDoBtn].forEach((b) => { if (b) { b.disabled = empty; b.style.opacity = empty ? '0.5' : ''; } });
    }

    function setSeg(groupId, attr, value) {
      const group = document.getElementById(groupId);
      if (!group) return;
      group.querySelectorAll('.seg-btn').forEach((b) => b.classList.toggle('active', b.getAttribute('data-' + attr) === value));
    }
    function syncSegs() {
      setSeg('ratioGroup', 'ratio', shareCfg.ratio);
      setSeg('themeGroup', 'theme', shareCfg.theme);
      setSeg('sortGroup', 'sort', shareCfg.sort);
    }

    function buildDeviceList() {
      if (!deviceListEl) return;
      deviceListEl.innerHTML = '';
      (lastShareData || []).forEach((it, i) => {
        const row = document.createElement('label');
        row.className = 'flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm hover:bg-white/5';
        row.innerHTML = `<input type="checkbox" class="share-check h-4 w-4 rounded" ${shareCfg.selected.has(i) ? 'checked' : ''}>
          <span class="min-w-0"><span class="block truncate text-white/90">${escapeHtml(it.name)}</span><span class="block truncate text-xs text-white/45">${escapeHtml(it.model)}</span></span>`;
        const input = row.querySelector('input');
        input.addEventListener('change', () => {
          if (input.checked) shareCfg.selected.add(i); else shareCfg.selected.delete(i);
          schedulePreview();
        });
        deviceListEl.appendChild(row);
      });
    }

    function openShareModal() {
      if (!lastShareData || !lastShareData.length) return;
      shareCfg.ratio = '4:5';
      shareCfg.theme = 'dark';
      shareCfg.showCost = true;
      shareCfg.sort = 'time';
      shareCfg.title = t('h1') || 'Is my Pods Worth It?';
      shareCfg.selected = new Set(lastShareData.map((_, i) => i));
      if (shareTitleInput) shareTitleInput.value = shareCfg.title;
      if (showCostToggle) showCostToggle.checked = true;
      syncSegs();
      buildDeviceList();
      shareModal.classList.remove('hidden');
      shareModal.classList.add('flex');
      shareModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      updateSharePreview();
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => { if (shareModal && !shareModal.classList.contains('hidden')) updateSharePreview(); });
      }
      const closeBtn = document.getElementById('shareClose');
      if (closeBtn) closeBtn.focus();
    }

    function closeShareModal() {
      shareModal.classList.add('hidden');
      shareModal.classList.remove('flex');
      shareModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      const btn = document.getElementById('shareBtn');
      if (btn) btn.focus();
    }

    function renderShareCanvas() {
      const dims = RATIO_DIMS[shareCfg.ratio] || RATIO_DIMS['4:5'];
      const canvas = document.createElement('canvas');
      canvas.width = dims[0];
      canvas.height = dims[1];
      drawShareCard(canvas.getContext('2d'), dims[0], dims[1], getShareItems(), {
        theme: shareCfg.theme, showCost: shareCfg.showCost, title: shareCfg.title
      });
      return canvas;
    }

    function shareFileName() {
      return 'is-my-pods-worth-it-' + shareCfg.ratio.replace(':', 'x') + '.png';
    }

    async function doDownload() {
      if (!getShareItems().length) return;
      if (document.fonts && document.fonts.ready) { try { await document.fonts.ready; } catch (e) {} }
      const blob = dataURLToBlob(renderShareCanvas().toDataURL('image/png'));
      downloadBlob(blob, shareFileName());
    }

    async function doShare() {
      if (!getShareItems().length) return;
      if (document.fonts && document.fonts.ready) { try { await document.fonts.ready; } catch (e) {} }
      const blob = dataURLToBlob(renderShareCanvas().toDataURL('image/png'));
      const file = new File([blob], shareFileName(), { type: 'image/png' });
      const shareText = t('shareText');
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file], text: shareText, title: 'Is my Pods Worth It?' })
          .catch(() => downloadBlob(blob, shareFileName()));
      } else {
        downloadBlob(blob, shareFileName());
      }
    }

    const shareBtnEl = document.getElementById('shareBtn');
    if (shareBtnEl) shareBtnEl.addEventListener('click', openShareModal);
    document.getElementById('shareClose')?.addEventListener('click', closeShareModal);
    document.getElementById('shareCancel')?.addEventListener('click', closeShareModal);
    document.getElementById('shareBackdrop')?.addEventListener('click', closeShareModal);
    document.getElementById('ratioGroup')?.querySelectorAll('.seg-btn').forEach((b) => b.addEventListener('click', () => { shareCfg.ratio = b.getAttribute('data-ratio'); syncSegs(); schedulePreview(); }));
    document.getElementById('themeGroup')?.querySelectorAll('.seg-btn').forEach((b) => b.addEventListener('click', () => { shareCfg.theme = b.getAttribute('data-theme'); syncSegs(); schedulePreview(); }));
    document.getElementById('sortGroup')?.querySelectorAll('.seg-btn').forEach((b) => b.addEventListener('click', () => { shareCfg.sort = b.getAttribute('data-sort'); syncSegs(); schedulePreview(); }));
    if (showCostToggle) showCostToggle.addEventListener('change', () => { shareCfg.showCost = showCostToggle.checked; schedulePreview(); });
    if (shareTitleInput) shareTitleInput.addEventListener('input', () => { shareCfg.title = shareTitleInput.value; schedulePreview(); });
    document.getElementById('selAll')?.addEventListener('click', () => { shareCfg.selected = new Set((lastShareData || []).map((_, i) => i)); buildDeviceList(); schedulePreview(); });
    document.getElementById('selNone')?.addEventListener('click', () => { shareCfg.selected = new Set(); buildDeviceList(); schedulePreview(); });
    if (shareDownloadBtn) shareDownloadBtn.addEventListener('click', doDownload);
    if (shareDoBtn) shareDoBtn.addEventListener('click', doShare);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && shareModal && !shareModal.classList.contains('hidden')) closeShareModal();
    });

    // ===== 匯出教學彈窗 =====
    const guideModal = document.getElementById('guideModal');
    function openGuide() {
      if (!guideModal) return;
      guideModal.classList.remove('hidden');
      guideModal.classList.add('flex');
      guideModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      const btn = document.getElementById('guideCloseX');
      if (btn) btn.focus();
    }
    function closeGuide() {
      if (!guideModal) return;
      guideModal.classList.add('hidden');
      guideModal.classList.remove('flex');
      guideModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      const btn = document.getElementById('helpBtn');
      if (btn) btn.focus();
    }
    const helpBtnEl = document.getElementById('helpBtn');
    if (helpBtnEl) helpBtnEl.addEventListener('click', (e) => { e.stopPropagation(); openGuide(); });
    document.getElementById('guideCloseX')?.addEventListener('click', closeGuide);
    document.getElementById('guideDone')?.addEventListener('click', closeGuide);
    document.getElementById('guideBackdrop')?.addEventListener('click', closeGuide);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && guideModal && !guideModal.classList.contains('hidden')) closeGuide();
    });

    window.addEventListener('hashchange', handleRoute);
    handleRoute();

    applyStaticTexts();