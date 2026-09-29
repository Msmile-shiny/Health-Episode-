/* ============================================================
   Episode · AI Health Navigator — 概念演示
   交互逻辑（虚构数据）
   ============================================================ */
(function () {
  'use strict';

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  /* ---------- 图标 ---------- */
  const ICONS = {
    pulse: '<path d="M3 12h3.2l2.1-5.6 3.6 11.2 2.4-5.6H21"/>',
    check: '<path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z"/><path d="M9.3 12l1.8 1.8 3.4-3.6"/>',
    eye: '<path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6z"/><circle cx="12" cy="12" r="2.6"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a12 12 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"/>',
    alert: '<path d="M12 3l10 17H2L12 3z"/><path d="M12 10v4M12 17.4v.2"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 8v4.5M12 15.6v.2"/>',
    user: '<circle cx="12" cy="8" r="3.6"/><path d="M5 20c1.2-3.2 3.9-5 7-5s5.8 1.8 7 5"/>',
    shield: '<path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z"/>',
  };
  const icon = (name) =>
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[name] + '</svg>';

  const esc = (s) =>
    String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ============================================================
     数据（全部为虚构示例）
     ============================================================ */
  const PATIENT = { name: '林夏', sex: '女', age: 34, allergy: '无已知过敏史', history: '无重大基础疾病' };

  const RED_FLAGS = [
    '呼吸困难',
    '胸痛或压迫感',
    '意识模糊或晕厥',
    '吞咽困难到无法进水',
    '高热（≥39°C）持续不退',
  ];

  const SERIES = [
    { key: 'throat', name: '喉咙痛', color: '#2a78d6' },
    { key: 'fever', name: '发热', color: '#eb6834' },
    { key: 'fatigue', name: '乏力', color: '#1baf7a' },
  ];

  const INITIAL_CHECKINS = [
    { day: 1, period: '早', time: '9/27 09:20', throat: 5, fever: 4, fatigue: 6, note: '晨起喉咙刺痛，略乏力' },
    { day: 1, period: '晚', time: '9/27 21:05', throat: 6, fever: 6, fatigue: 6, note: '晚间发热感明显，体温 37.8°C' },
    { day: 2, period: '早', time: '9/28 08:40', throat: 5, fever: 3, fatigue: 5, note: '睡眠后略缓解，仍觉乏力' },
    { day: 2, period: '晚', time: '9/28 20:15', throat: 4, fever: 2, fatigue: 4, note: '体温 37.1°C，食欲恢复' },
    { day: 3, period: '早', time: '9/29 09:00', throat: 3, fever: 1, fatigue: 3, note: '明显好转，偶有咽干' },
  ];

  const FEVER_TO_TEMP = { 0: '36.6', 1: '37.0', 2: '37.1', 3: '37.4', 4: '37.8', 5: '38.2', 6: '38.6', 7: '38.9', 8: '39.2', 9: '39.5', 10: '39.8' };

  const TIERS = {
    good: {
      label: '继续观察', cls: 'tier-good', ic: 'check',
      title: '在家继续观察',
      reason: '症状轻微，且整体在好转，目前没有需要立即就医的信号。',
      actions: [
        '继续多喝水、多休息，观察 24–48 小时',
        '若症状加重或出现新的不适，再来打卡记录',
      ],
    },
    warn: {
      label: '密切观察', cls: 'tier-warn', ic: 'eye',
      title: '密切观察 · 建议持续追踪',
      reason: '症状为轻到中度，病程仍在进行。建议持续监测；若发热回升或疼痛加重，及时升级处理。',
      actions: [
        '每半天打卡一次，记录体温与喉咙痛程度',
        '多休息、多饮水；可服用非处方止痛药（如布洛芬）缓解',
        '若 48 小时内无好转，或发热超过 38.5°C，考虑咨询医生',
      ],
    },
    serious: {
      label: '建议咨询', cls: 'tier-serious', ic: 'phone',
      title: '建议咨询 · 寻求专业意见',
      reason: '症状较明显或持续不缓解，建议联系医生或基层医疗服务做进一步评估。',
      actions: [
        '尽快预约线上问诊或全科门诊',
        '带上 Doctor Handoff 摘要，帮助医生快速了解情况',
        '若出现呼吸困难、胸痛等，立即前往急诊',
      ],
    },
    critical: {
      label: '尽快就医', cls: 'tier-critical', ic: 'alert',
      title: '尽快就医 · 请不要拖延',
      reason: '你报告了需要警惕的危险信号，建议尽快寻求专业医疗帮助。',
      actions: [
        '立即前往急诊，或拨打当地急救电话',
        '向接诊人员说明你报告的危险信号与症状变化',
        '如有他人陪同，请其协助前往',
      ],
    },
  };

  /* ============================================================
     视图路由
     ============================================================ */
  const state = {
    checkins: INITIAL_CHECKINS.map((c) => Object.assign({}, c)),
    answers: { symptoms: ['喉咙痛', '乏力'], onset: '1–2 天前', severity: 5, fever: '37.5–38.5°C', redflags: [], extra: '' },
    tier: 'warn',
    intakeStep: 0,
  };

  function showView(name) {
    $$('.view').forEach((v) => v.classList.remove('is-active'));
    const el = $('[data-view="' + name + '"]');
    if (el) el.classList.add('is-active');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (name === 'intake') startIntake();
    if (name === 'episode') renderEpisode();
    if (name === 'handoff') renderHandoff();

    if (history.replaceState) { try { history.replaceState(null, '', '#' + name); } catch (e) { /* noop */ } }
  }

  document.addEventListener('click', (e) => {
    const nav = e.target.closest('[data-nav]');
    if (nav) { e.preventDefault(); showView(nav.getAttribute('data-nav')); return; }
    const sc = e.target.closest('[data-scroll]');
    if (sc) {
      e.preventDefault();
      const t = $(sc.getAttribute('data-scroll'));
      if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  /* ============================================================
     Toast
     ============================================================ */
  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('is-show'), 2400);
  }

  /* ============================================================
     结构化问询
     ============================================================ */
  const STEPS = [
    {
      key: 'symptoms', type: 'multi',
      ai: '你好，我是 Episode 的健康导航。我们先从最简单的开始：<strong>你现在哪里感觉不舒服？</strong><span class="note">可以多选。这只是帮你梳理情况，不构成诊断。</span>',
      options: ['喉咙痛', '咳嗽', '头痛', '发热', '乏力', '鼻塞流涕'],
      min: 1, cta: '下一步',
    },
    {
      key: 'onset', type: 'single',
      ai: '明白了。那喉咙痛是从什么时候开始的？',
      options: ['今天刚开始', '1–2 天前', '3–5 天前', '超过一周'],
    },
    {
      key: 'severity', type: 'scale',
      ai: '如果用一个 0–10 的分来打分（<strong>0 完全没事，10 最严重</strong>），现在喉咙痛大概几分？',
    },
    {
      key: 'fever', type: 'single',
      ai: '过去两天，有没有发烧的感觉？量过体温吗？',
      options: ['没量过', '37.5°C 以下', '37.5–38.5°C', '38.5°C 以上'],
    },
    {
      key: 'redflags', type: 'multi',
      ai: '接下来要问几个安全相关的问题。最近<strong>有没有出现以下情况？</strong><span class="note">这一步用于筛查需要尽快处理的信号。</span>',
      options: RED_FLAGS,
      none: '都没有这些情况',
      min: 0, cta: '确认',
    },
    {
      key: 'extra', type: 'text',
      ai: '除了喉咙和乏力，还有别的想补充的吗？<span class="note">选填，可以直接跳过。</span>',
    },
  ];

  function startIntake() {
    state.answers = {};
    state.intakeStep = 0;
    $('#chat').innerHTML = '';
    $('#chat-input').innerHTML = '';
    runStep(0);
  }

  function setProgress(i) {
    const total = STEPS.length;
    const pct = Math.round(((i) / total) * 100);
    $('#intake-progress-label').textContent = '第 ' + (i + 1) + ' / ' + total + ' 步';
    $('#intake-progress-fill').style.width = pct + '%';
  }

  function addMsg(role, html) {
    const chat = $('#chat');
    const wrap = document.createElement('div');
    wrap.className = 'msg ' + role;
    wrap.innerHTML =
      '<div class="msg-avatar">' + (role === 'ai' ? icon('pulse') : icon('user')) + '</div>' +
      '<div class="msg-bubble">' + html + '</div>';
    chat.appendChild(wrap);
    chat.scrollTop = chat.scrollHeight;
    return wrap;
  }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  async function aiSay(html) {
    const m = addMsg('ai', '<span class="typing"><span></span><span></span><span></span></span>');
    await sleep(620);
    m.querySelector('.msg-bubble').innerHTML = html;
    $('#chat').scrollTop = $('#chat').scrollHeight;
  }

  async function runStep(i) {
    state.intakeStep = i;
    setProgress(i);
    const step = STEPS[i];
    await aiSay(step.ai);
    await sleep(180);
    renderInput(step);
  }

  function renderInput(step) {
    const box = $('#chat-input');
    box.innerHTML = '';

    if (step.type === 'multi') {
      const chips = document.createElement('div');
      chips.className = 'chips';
      const selected = new Set();

      if (step.none) {
        const noneBtn = document.createElement('button');
        noneBtn.className = 'chip none';
        noneBtn.textContent = step.none;
        noneBtn.addEventListener('click', () => {
          selected.clear();
          $$('.chip', chips).forEach((c) => c.classList.remove('is-on'));
          noneBtn.classList.add('is-on');
        });
        chips.appendChild(noneBtn);
      }

      step.options.forEach((opt) => {
        const b = document.createElement('button');
        b.className = 'chip';
        b.textContent = opt;
        b.addEventListener('click', () => {
          if (step.none) $$('.chip.none', chips).forEach((c) => c.classList.remove('is-on'));
          if (selected.has(opt)) { selected.delete(opt); b.classList.remove('is-on'); }
          else { selected.add(opt); b.classList.add('is-on'); }
        });
        chips.appendChild(b);
      });
      box.appendChild(chips);

      const act = document.createElement('div');
      act.className = 'input-actions';
      const cta = document.createElement('button');
      cta.className = 'btn btn-primary';
      cta.textContent = step.cta || '下一步';
      cta.addEventListener('click', () => {
        if (step.none && $$('.chip.none', chips)[0].classList.contains('is-on')) {
          submitAnswer(step.key, []);
          return;
        }
        if (selected.size < (step.min || 1)) { toast('请至少选择一个选项'); return; }
        submitAnswer(step.key, Array.from(selected));
      });
      act.appendChild(cta);
      if (step.none) {
        const hint = document.createElement('span');
        hint.className = 'input-hint';
        hint.textContent = '选择「都没有」即表示未报告上述危险信号。';
        act.appendChild(hint);
      }
      box.appendChild(act);
    }

    else if (step.type === 'single') {
      const chips = document.createElement('div');
      chips.className = 'chips';
      step.options.forEach((opt) => {
        const b = document.createElement('button');
        b.className = 'chip';
        b.textContent = opt;
        b.addEventListener('click', () => submitAnswer(step.key, opt));
        chips.appendChild(b);
      });
      box.appendChild(chips);
    }

    else if (step.type === 'scale') {
      const wrap = document.createElement('div');
      wrap.className = 'scale-wrap';
      const val = document.createElement('div');
      val.className = 'scale-value';
      val.innerHTML = '<span id="scale-num">5</span><small> / 10</small>';
      const range = document.createElement('input');
      range.type = 'range'; range.min = 0; range.max = 10; range.value = 5;
      range.addEventListener('input', () => { $('#scale-num').textContent = range.value; });
      const labels = document.createElement('div');
      labels.className = 'scale-labels';
      labels.innerHTML = '<span>0 · 完全没事</span><span>5 · 中等</span><span>10 · 最严重</span>';
      wrap.append(val, range, labels);
      box.appendChild(wrap);

      const act = document.createElement('div');
      act.className = 'input-actions';
      const cta = document.createElement('button');
      cta.className = 'btn btn-primary';
      cta.textContent = '确认';
      cta.addEventListener('click', () => submitAnswer(step.key, Number(range.value)));
      act.appendChild(cta);
      box.appendChild(act);
    }

    else if (step.type === 'text') {
      const ta = document.createElement('textarea');
      ta.className = 'textarea';
      ta.placeholder = '例如：最近睡眠不好、工作压力大……（选填）';
      box.appendChild(ta);

      const act = document.createElement('div');
      act.className = 'input-actions';
      const skip = document.createElement('button');
      skip.className = 'btn btn-ghost';
      skip.textContent = '跳过';
      skip.addEventListener('click', () => submitAnswer(step.key, ''));
      const cta = document.createElement('button');
      cta.className = 'btn btn-primary';
      cta.textContent = '继续';
      cta.addEventListener('click', () => submitAnswer(step.key, ta.value.trim()));
      act.append(skip, cta);
      box.appendChild(act);
    }
  }

  function answerSummary(key, value) {
    switch (key) {
      case 'symptoms': return value.join('、');
      case 'onset': return value;
      case 'severity': return '喉咙痛程度 ' + value + ' / 10';
      case 'fever': return '体温：' + value;
      case 'redflags': return value.length ? value.join('、') : '没有报告上述危险信号';
      case 'extra': return value || '（无补充）';
    }
    return String(value);
  }

  async function submitAnswer(key, value) {
    state.answers[key] = value;
    $('#chat-input').innerHTML = '';
    addMsg('user', esc(answerSummary(key, value)));

    const next = state.intakeStep + 1;
    if (next < STEPS.length) {
      await sleep(320);
      runStep(next);
    } else {
      await sleep(360);
      finishIntake();
    }
  }

  async function finishIntake() {
    state.checkins = INITIAL_CHECKINS.map((c) => Object.assign({}, c));
    state.tier = computeTier(state.answers);
    const m = addMsg('ai', '<span class="typing"><span></span><span></span><span></span></span>');
    await sleep(900);
    m.querySelector('.msg-bubble').innerHTML =
      '好，我已经把你说的这些整理好了。<strong>你的 Health Episode 已建立。</strong><span class="note">下面是基于你自述的演示性建议，请记得它不替代专业医疗判断。</span>';

    const act = document.createElement('div');
    act.className = 'input-actions';
    act.style.marginTop = '18px';
    const cta = document.createElement('button');
    cta.className = 'btn btn-primary btn-lg';
    cta.innerHTML = '查看我的 Episode ' + icon('check');
    cta.addEventListener('click', () => showView('episode'));
    act.appendChild(cta);
    $('#chat-input').innerHTML = '';
    $('#chat-input').appendChild(act);
    $('#chat').scrollTop = $('#chat').scrollHeight;
  }

  function computeTier(a) {
    if (a.redflags && a.redflags.length) return 'critical';
    const sev = Number(a.severity) || 0;
    if (sev >= 7) return 'serious';
    if (a.fever === '38.5°C 以上') return 'serious';
    if (sev >= 4 || a.fever === '37.5–38.5°C') return 'warn';
    return 'good';
  }

  /* ============================================================
     Episode 面板
     ============================================================ */
  function renderEpisode() {
    const c = state.checkins;
    const last = c[c.length - 1];
    const tier = TIERS[state.tier];

    $('#ep-title').textContent = '喉咙痛伴低热';
    $('#ep-meta').textContent = '9 月 27 日起 · 第 ' + last.day + ' 天 · 上次更新 ' + last.time;

    renderTier(tier);
    renderChart();
    renderTimeline();
    renderSummary();
    renderFlags();
  }

  function renderTier(tier) {
    const el = $('#tier-card');
    el.className = 'tier-card ' + tier.cls;
    el.innerHTML =
      '<div class="tier-icon">' + icon(tier.ic) + '</div>' +
      '<div>' +
        '<div class="tier-head"><span class="tier-title">' + tier.title + '</span><span class="tier-badge">' + tier.label + '</span></div>' +
        '<p class="tier-reason">' + tier.reason + '</p>' +
        '<ul class="tier-actions">' + tier.actions.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul>' +
      '</div>';
  }

  function renderSummary() {
    const a = state.answers;
    const c = state.checkins;
    const last = c[c.length - 1];
    const rows = [
      ['主要症状', (a.symptoms || ['喉咙痛', '乏力']).join('、')],
      ['开始时间', a.onset || '1–2 天前'],
      ['当前严重度', (a.severity != null ? a.severity : 5) + ' / 10'],
      ['体温（自测）', a.fever || '37.5–38.5°C'],
      ['最近体温', FEVER_TO_TEMP[last.fever] + '°C'],
      ['状态', '进行中'],
    ];
    $('#ep-summary').innerHTML = rows.map((r) => '<div><dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd></div>').join('');
  }

  function renderFlags() {
    const flagged = state.answers.redflags || [];
    $('#flag-list').innerHTML = RED_FLAGS.map((f) => {
      const hit = flagged.includes(f);
      return '<li>' +
        (hit ? '<span class="flag-alert">' + icon('alert') + '</span><b>' + f + '</b>' : '<span class="flag-ok">' + icon('check') + '</span>' + f) +
        '</li>';
    }).join('');
  }

  /* ============================================================
     图表（手绘 SVG 折线）
     ============================================================ */
  const CHART = { W: 680, H: 300, padL: 40, padR: 64, padT: 20, padB: 46 };
  let chartModel = null;

  function buildChartModel() {
    const c = state.checkins;
    const innerW = CHART.W - CHART.padL - CHART.padR;
    const innerH = CHART.H - CHART.padT - CHART.padB;
    const x = (i) => CHART.padL + (c.length === 1 ? innerW / 2 : (i / (c.length - 1)) * innerW);
    const y = (v) => CHART.padT + ((10 - v) / 10) * innerH;

    const points = c.map((row, i) => ({
      x: x(i), y: y(0),
      label: '第' + row.day + '天 · ' + row.period,
      time: row.time,
      throat: row.throat, fever: row.fever, fatigue: row.fatigue,
    }));

    const series = SERIES.map((s) => ({
      key: s.key, name: s.name, color: s.color,
      pts: c.map((row, i) => ({ x: x(i), y: y(row[s.key]) })),
    }));

    chartModel = { points, series, innerW, innerH };
    return { points, series, innerW, innerH };
  }

  function renderChart() {
    const { points, series, innerW, innerH } = buildChartModel();
    const wrap = $('#chart-wrap');
    wrap.innerHTML = '';

    let s = '<svg class="chart-svg" viewBox="0 0 ' + CHART.W + ' ' + CHART.H + '" preserveAspectRatio="xMidYMid meet">';

    // 网格线 + Y 轴标签
    [0, 5, 10].forEach((v) => {
      const yy = CHART.padT + ((10 - v) / 10) * innerH;
      s += '<line class="gridline" x1="' + CHART.padL + '" y1="' + yy + '" x2="' + (CHART.W - CHART.padR) + '" y2="' + yy + '"/>';
      s += '<text class="axis-label" x="' + (CHART.padL - 10) + '" y="' + (yy + 4) + '" text-anchor="end">' + v + '</text>';
    });
    s += '<line class="axis-line" x1="' + CHART.padL + '" y1="' + CHART.padT + '" x2="' + CHART.padL + '" y2="' + (CHART.H - CHART.padB) + '"/>';
    s += '<line class="axis-line" x1="' + CHART.padL + '" y1="' + (CHART.H - CHART.padB) + '" x2="' + (CHART.W - CHART.padR) + '" y2="' + (CHART.H - CHART.padB) + '"/>';

    // X 轴标签（去重相邻）
    const seen = [];
    points.forEach((p) => {
      if (seen.indexOf(p.label) !== -1) return;
      seen.push(p.label);
      s += '<text class="axis-label" x="' + p.x + '" y="' + (CHART.H - CHART.padB + 22) + '" text-anchor="middle">' + p.label + '</text>';
    });

    // 系列折线 + 圆点 + 末端标签
    series.forEach((sr, si) => {
      const line = sr.pts.map((p) => p.x.toFixed(1) + ',' + p.y.toFixed(1)).join(' ');
      s += '<path class="series-line" d="M' + line + '" stroke="' + sr.color + '"/>';
      sr.pts.forEach((p) => {
        s += '<circle class="series-dot" cx="' + p.x + '" cy="' + p.y + '" r="3.4" fill="' + sr.color + '"/>';
      });
      const lastP = sr.pts[sr.pts.length - 1];
      const dy = si * 16 - (series.length - 1) * 8;
      s += '<text class="end-label" x="' + (lastP.x + 8) + '" y="' + (lastP.y + dy + 4) + '" fill="' + sr.color + '">' + sr.name + '</text>';
    });

    // 悬停十字线
    s += '<line class="crosshair" id="chart-crosshair" x1="0" y1="' + CHART.padT + '" x2="0" y2="' + (CHART.H - CHART.padB) + '" opacity="0"/>';
    s += '</svg>';

    // 图例
    let legend = '<div class="chart-legend">';
    series.forEach((sr) => {
      const last = state.checkins[state.checkins.length - 1];
      legend += '<span class="legend-item"><span class="legend-swatch" style="background:' + sr.color + '"></span>' + sr.name + ' <span class="lval">' + last[sr.key] + '</span></span>';
    });
    legend += '</div>';

    wrap.innerHTML = s + legend + '<div class="chart-tip" id="chart-tip"></div>';
    attachChartHover(wrap);
  }

  function attachChartHover(wrap) {
    const svg = $('.chart-svg', wrap);
    const tip = $('#chart-tip', wrap);
    const cross = $('#chart-crosshair', wrap);
    if (!svg || !chartModel) return;

    svg.addEventListener('mousemove', (e) => {
      const rect = svg.getBoundingClientRect();
      const xView = ((e.clientX - rect.left) / rect.width) * CHART.W;
      const pts = chartModel.points;
      let idx = 0, best = Infinity;
      pts.forEach((p, i) => { const d = Math.abs(p.x - xView); if (d < best) { best = d; idx = i; } });
      const p = pts[idx];

      cross.setAttribute('x1', p.x); cross.setAttribute('x2', p.x);
      cross.setAttribute('opacity', '1');

      tip.innerHTML = '<b>' + p.label + '</b> · ' + p.time + '<br>' +
        SERIES.map((sr, si) => '<span style="color:#fff">' + '<span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:' + sr.color + ';margin-right:5px"></span>' + sr.name + ' ' + p[sr.key] + '</span>').join('<br>');
      tip.style.opacity = '1';

      const wrapRect = wrap.getBoundingClientRect();
      let left = e.clientX - wrapRect.left;
      left = Math.max(70, Math.min(wrapRect.width - 70, left));
      tip.style.left = left + 'px';
      tip.style.top = (e.clientY - wrapRect.top - 12) + 'px';
    });

    svg.addEventListener('mouseleave', () => {
      cross.setAttribute('opacity', '0');
      tip.style.opacity = '0';
    });
  }

  /* ============================================================
     时间线
     ============================================================ */
  function renderTimeline() {
    const c = state.checkins;
    const html = c.slice().reverse().map((row) => {
      const sev = SERIES.map((s) => '<span class="sev-chip">' + s.name + ' <b>' + row[s.key] + '</b></span>').join('');
      return '<li class="tl-item">' +
        '<span class="tl-dot"></span>' +
        '<div class="tl-time">第 ' + row.day + ' 天 · ' + row.period + '<small>' + row.time + '</small></div>' +
        '<p class="tl-note">' + esc(row.note) + '</p>' +
        '<div class="tl-sev">' + sev + '</div>' +
        '</li>';
    }).join('');
    $('#timeline').innerHTML = html;
  }

  /* ============================================================
     打卡（记录一次新的症状）
     ============================================================ */
  function openCheckin() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-backdrop';
    const sliders = SERIES.map((s) =>
      '<div class="modal-field"><div class="modal-field-head"><label>' + s.name + '</label><b id="ck-' + s.key + '">5</b></div>' +
      '<input type="range" min="0" max="10" value="5" data-key="' + s.key + '" class="ck-range"></div>'
    ).join('');

    overlay.innerHTML =
      '<div class="modal" role="dialog" aria-modal="true" aria-label="记录一次打卡">' +
        '<h3>打卡 · 记录此刻的感受</h3>' +
        '<p class="card-sub">0 = 无不适 · 10 = 最严重</p>' +
        sliders +
        '<textarea class="textarea ck-note" placeholder="简单记一句，例如：感觉比早上好一点（选填）"></textarea>' +
        '<div class="modal-actions">' +
          '<button class="btn btn-ghost" id="ck-cancel">取消</button>' +
          '<button class="btn btn-primary" id="ck-submit">提交打卡</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);

    $$('.ck-range', overlay).forEach((r) => {
      r.addEventListener('input', () => { $('#ck-' + r.getAttribute('data-key'), overlay).textContent = r.value; });
    });

    $('#ck-cancel', overlay).addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    $('#ck-submit', overlay).addEventListener('click', () => {
      const vals = {};
      $$('.ck-range', overlay).forEach((r) => { vals[r.getAttribute('data-key')] = Number(r.value); });
      const note = $('.ck-note', overlay).value.trim();

      const last = state.checkins[state.checkins.length - 1];
      let day = last.day, period = last.period === '早' ? '晚' : '早';
      if (period === '早') day += 1;

      state.checkins.push({
        day, period, time: '刚刚',
        throat: vals.throat, fever: vals.fever, fatigue: vals.fatigue,
        note: note || '记录了一次打卡',
      });

      overlay.remove();
      renderEpisode();
      toast('已记录，症状趋势已更新');
    });
  }

  /* ============================================================
     Doctor Handoff 就医摘要
     ============================================================ */
  function latestVitals() {
    const c = state.checkins;
    const last = c[c.length - 1];
    return { temp: FEVER_TO_TEMP[last.fever], hr: 78 };
  }

  function renderHandoff() {
    const a = state.answers;
    const c = state.checkins;
    const last = c[c.length - 1];
    const vitals = latestVitals();
    const tier = TIERS[state.tier];
    const symptoms = (a.symptoms || ['喉咙痛', '乏力']);
    const flagged = (a.redflags || []);
    const today = new Date();
    const dateStr = (today.getMonth() + 1) + ' 月 ' + today.getDate() + ' 日 ' + today.getFullYear();

    const courseRows = c.slice(-5).map((row) =>
      '<tr><td>第 ' + row.day + ' 天 · ' + row.period + '</td>' +
      '<td class="num">' + row.throat + '</td><td class="num">' + row.fever + '</td><td class="num">' + row.fatigue + '</td></tr>'
    ).join('');

    const flagsHtml = RED_FLAGS.map((f) =>
      '<span>' + (flagged.includes(f) ? icon('alert') : icon('check')) + f + '</span>'
    ).join('');

    $('#handoff-doc').innerHTML =
      '<div class="handoff-banner">' + icon('info') +
        '<span>本摘要由 AI 依据用户自述生成，<strong>未经医疗专业人员核实</strong>，仅供就诊沟通参考。</span></div>' +

      '<div class="handoff-title">' +
        '<div><span class="ht-kicker">Doctor Handoff · 就医摘要</span><h2>喉咙痛伴低热</h2></div>' +
        '<div class="ht-date">生成于 ' + dateStr + '<br>第 ' + last.day + ' 天 · ' + tier.label + '</div>' +
      '</div>' +

      '<div class="handoff-section">' +
        '<h3>患者概览</h3>' +
        '<div class="patient-grid">' +
          '<div class="patient-cell"><div class="k">姓名</div><div class="v">' + PATIENT.name + '</div></div>' +
          '<div class="patient-cell"><div class="k">性别 / 年龄</div><div class="v">' + PATIENT.sex + ' · ' + PATIENT.age + ' 岁</div></div>' +
          '<div class="patient-cell"><div class="k">过敏史</div><div class="v">' + PATIENT.allergy + '</div></div>' +
          '<div class="patient-cell"><div class="k">基础疾病</div><div class="v">' + PATIENT.history + '</div></div>' +
        '</div></div>' +

      '<div class="handoff-section">' +
        '<h3>主诉</h3>' +
        '<p>' + esc(symptoms.join('、')) + ' ' + (a.onset || '2 天') + '。</p></div>' +

      '<div class="handoff-section">' +
        '<h3>现病史</h3>' +
        '<p>' + buildHpi(symptoms, flagged) + '</p></div>' +

      '<div class="handoff-section">' +
        '<h3>症状趋势（0–10 自评）</h3>' +
        '<table class="course-table"><thead><tr><th>时间</th><th>喉咙痛</th><th>发热</th><th>乏力</th></tr></thead><tbody>' + courseRows + '</tbody></table></div>' +

      '<div class="handoff-section">' +
        '<h3>关键体征（自测）</h3>' +
        '<p>最近体温 <strong>' + vitals.temp + '°C</strong> · 静息心率 <strong>' + vitals.hr + ' 次/分</strong>（用户自测，未经核实）</p></div>' +

      '<div class="handoff-section">' +
        '<h3>危险信号排查</h3>' +
        '<div class="flags-neg">' + flagsHtml + '</div></div>' +

      '<div class="handoff-section">' +
        '<h3>自行处理</h3>' +
        '<p>温水漱口、多饮水；布洛芬 200mg 按需（自购，遵说明书）。</p></div>' +

      '<div class="handoff-section">' +
        '<h3>就诊诉求</h3>' +
        '<p>希望确认是否为细菌性咽炎、是否需要抗生素；乏力已影响日常工作。</p></div>';
  }

  function buildHpi(symptoms, flagged) {
    const sev = state.answers.severity != null ? state.answers.severity : 5;
    const onset = state.answers.onset || '1–2 天前';
    const last = state.checkins[state.checkins.length - 1];
    let txt = '患者约 ' + onset + ' 起出现 ' + symptoms.join('、') + '，自评最重时 ' + sev + '/10' +
      '，自述发热，最高 37.8°C（自测）。病程中自行口服布洛芬并温水漱口。' +
      '近 24 小时症状整体改善：体温回落至 ' + FEVER_TO_TEMP[last.fever] + '°C，喉咙痛降至 ' + last.throat + '/10，乏力减轻。';
    if (flagged.length) {
      txt += ' 患者报告了危险信号：' + flagged.join('、') + '，建议尽快就医。';
    } else {
      txt += ' 病程中无呼吸困难、胸痛、意识模糊、吞咽困难或高热不退。';
    }
    return txt;
  }

  function buildHandoffText() {
    const a = state.answers;
    const c = state.checkins;
    const last = c[c.length - 1];
    const vitals = latestVitals();
    const symptoms = (a.symptoms || ['喉咙痛', '乏力']).join('、');
    const lines = [];
    lines.push('【Doctor Handoff · 就医摘要】（演示 · 虚构数据，未经核实）');
    lines.push('');
    lines.push('患者：' + PATIENT.name + '，' + PATIENT.sex + '，' + PATIENT.age + ' 岁；过敏史：' + PATIENT.allergy + '；基础疾病：' + PATIENT.history);
    lines.push('主诉：' + symptoms + ' ' + (a.onset || '2 天'));
    lines.push('');
    lines.push('现病史：' + buildHpi((a.symptoms || ['喉咙痛', '乏力']), (a.redflags || [])));
    lines.push('');
    lines.push('症状趋势（0–10）：');
    c.slice(-5).forEach((row) => {
      lines.push('  第 ' + row.day + ' 天 · ' + row.period + ' — 喉咙痛 ' + row.throat + '，发热 ' + row.fever + '，乏力 ' + row.fatigue);
    });
    lines.push('');
    lines.push('关键体征（自测）：体温 ' + vitals.temp + '°C，静息心率 ' + vitals.hr + ' 次/分');
    lines.push('自行处理：温水漱口、多饮水；布洛芬 200mg 按需。');
    lines.push('就诊诉求：确认是否为细菌性咽炎、是否需要抗生素。');
    return lines.join('\n');
  }

  /* ============================================================
     初始化
     ============================================================ */
  function bind() {
    $('#btn-checkin').addEventListener('click', openCheckin);
    $('#btn-copy').addEventListener('click', () => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(buildHandoffText()).then(() => toast('摘要已复制到剪贴板'));
      } else {
        const ta = document.createElement('textarea');
        ta.value = buildHandoffText();
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); toast('摘要已复制到剪贴板'); } catch (e) { toast('复制失败，请手动选择文本'); }
        ta.remove();
      }
    });
    $('#btn-print').addEventListener('click', () => window.print());
  }

  bind();

  // 支持 #landing / #intake / #episode / #handoff 深链
  const initial = location.hash ? location.hash.slice(1) : '';
  if (['intake', 'episode', 'handoff'].indexOf(initial) !== -1) {
    showView(initial);
  } else {
    showView('landing');
  }
  window.addEventListener('hashchange', () => {
    const h = location.hash.slice(1);
    if (['landing', 'intake', 'episode', 'handoff'].indexOf(h) !== -1) showView(h);
  });
})();
