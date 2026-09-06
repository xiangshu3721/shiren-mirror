/**
 * 知人镜 · 模块结构图（东方墨金审美 SVG）
 * 安全：纯 markup，无脚本。由 module 页在 kb.js 之后加载并挂到各模块。
 */
(function () {
  "use strict";

  var G = "#c4a574";
  var GD = "rgba(196,165,116,0.35)";
  var INK = "#e8e0d4";
  var DIM = "#a89f90";
  var BG = "#1a1814";
  var RED = "#c47a6a";
  var OK = "#8a9a7b";

  function svg(vb, body) {
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' +
      vb +
      '" role="img" aria-hidden="true">' +
      body +
      "</svg>"
    );
  }

  var D = {};

  /* 六层：垂直叠层 */
  D["six-layer"] = svg(
    "0 0 320 220",
    '<rect width="320" height="220" fill="' + BG + '" rx="8"/>' +
      [
        ["行为", 12],
        ["即时目的", 44],
        ["核心恐惧", 76],
        ["防御", 108],
        ["核心需要", 140],
        ["早期脚本", 172]
      ]
        .map(function (row, i) {
          var w = 280 - i * 18;
          var x = 20 + i * 9;
          var op = 0.25 + i * 0.12;
          return (
            '<rect x="' +
            x +
            '" y="' +
            row[1] +
            '" width="' +
            w +
            '" height="26" rx="4" fill="rgba(196,165,116,' +
            op.toFixed(2) +
            ')" stroke="' +
            G +
            '" stroke-width="1"/>' +
            '<text x="160" y="' +
            (row[1] + 17) +
            '" text-anchor="middle" fill="' +
            INK +
            '" font-size="12" font-family="sans-serif">' +
            (i + 1) +
            ". " +
            row[0] +
            "</text>"
          );
        })
        .join("")
  );

  /* 八动机：2×4 网格 */
  D["eight-motives"] = svg(
    "0 0 320 160",
    '<rect width="320" height="160" fill="' + BG + '" rx="8"/>' +
      ["安全", "关系", "价值", "自主", "羞耻", "权力", "归属", "意义"]
        .map(function (label, i) {
          var col = i % 4;
          var row = (i / 4) | 0;
          var x = 14 + col * 76;
          var y = 18 + row * 68;
          return (
            '<rect x="' +
            x +
            '" y="' +
            y +
            '" width="68" height="52" rx="6" fill="rgba(196,165,116,0.12)" stroke="' +
            G +
            '" stroke-width="1"/>' +
            '<text x="' +
            (x + 34) +
            '" y="' +
            (y + 30) +
            '" text-anchor="middle" fill="' +
            INK +
            '" font-size="12" font-family="sans-serif">' +
            label +
            "</text>"
          );
        })
        .join("")
  );

  /* 依恋：2×2 */
  D["attachment"] = svg(
    "0 0 300 180",
    '<rect width="300" height="180" fill="' + BG + '" rx="8"/>' +
      '<line x1="150" y1="20" x2="150" y2="160" stroke="' +
      GD +
      '" stroke-width="1"/>' +
      '<line x1="30" y1="90" x2="270" y2="90" stroke="' +
      GD +
      '" stroke-width="1"/>' +
      [
        [75, 50, "安全"],
        [225, 50, "焦虑"],
        [75, 130, "回避"],
        [225, 130, "混乱"]
      ]
        .map(function (c) {
          return (
            '<circle cx="' +
            c[0] +
            '" cy="' +
            c[1] +
            '" r="28" fill="rgba(196,165,116,0.15)" stroke="' +
            G +
            '"/>' +
            '<text x="' +
            c[0] +
            '" y="' +
            (c[1] + 4) +
            '" text-anchor="middle" fill="' +
            INK +
            '" font-size="12" font-family="sans-serif">' +
            c[2] +
            "</text>"
          );
        })
        .join("")
  );

  /* 防御：盾牌 + 标签 */
  D["defense"] = svg(
    "0 0 320 180",
    '<rect width="320" height="180" fill="' + BG + '" rx="8"/>' +
      '<path d="M160 28 L210 48 L210 100 Q210 140 160 158 Q110 140 110 100 L110 48 Z" fill="rgba(196,165,116,0.18)" stroke="' +
      G +
      '" stroke-width="1.5"/>' +
      '<text x="160" y="100" text-anchor="middle" fill="' +
      G +
      '" font-size="11" font-family="sans-serif">防御</text>' +
      [
        [42, 40, "否认"],
        [278, 40, "投射"],
        [42, 90, "讨好"],
        [278, 90, "回避"],
        [42, 140, "控制"],
        [278, 140, "完美"]
      ]
        .map(function (t) {
          return (
            '<text x="' +
            t[0] +
            '" y="' +
            t[1] +
            '" text-anchor="middle" fill="' +
            INK +
            '" font-size="11" font-family="sans-serif">' +
            t[2] +
            "</text>"
          );
        })
        .join("")
  );

  /* 防骗：红绿流程 */
  D["anti-fraud"] = svg(
    "0 0 320 170",
    '<rect width="320" height="170" fill="' + BG + '" rx="8"/>' +
      '<rect x="20" y="24" width="90" height="50" rx="6" fill="rgba(196,122,106,0.2)" stroke="' +
      RED +
      '"/>' +
      '<text x="65" y="46" text-anchor="middle" fill="' +
      INK +
      '" font-size="11" font-family="sans-serif">红旗</text>' +
      '<text x="65" y="62" text-anchor="middle" fill="' +
      DIM +
      '" font-size="10" font-family="sans-serif">催促·不透明</text>' +
      '<rect x="115" y="24" width="90" height="50" rx="6" fill="rgba(138,154,123,0.2)" stroke="' +
      OK +
      '"/>' +
      '<text x="160" y="46" text-anchor="middle" fill="' +
      INK +
      '" font-size="11" font-family="sans-serif">绿旗</text>' +
      '<text x="160" y="62" text-anchor="middle" fill="' +
      DIM +
      '" font-size="10" font-family="sans-serif">一致·可慢</text>' +
      '<rect x="210" y="24" width="90" height="50" rx="6" fill="rgba(196,165,116,0.12)" stroke="' +
      G +
      '"/>' +
      '<text x="255" y="54" text-anchor="middle" fill="' +
      INK +
      '" font-size="11" font-family="sans-serif">一致性</text>' +
      '<path d="M160 84 L160 100" stroke="' +
      G +
      '" stroke-width="1.5"/>' +
      '<rect x="70" y="100" width="180" height="48" rx="6" fill="rgba(196,165,116,0.1)" stroke="' +
      G +
      '"/>' +
      '<text x="160" y="122" text-anchor="middle" fill="' +
      INK +
      '" font-size="12" font-family="sans-serif">冷静期 → 核实 → 再信任</text>' +
      '<text x="160" y="140" text-anchor="middle" fill="' +
      DIM +
      '" font-size="10" font-family="sans-serif">保护自己 ≠ 定罪</text>'
  );

  /* 抱持伦理：三柱 */
  D["hold-ethic"] = svg(
    "0 0 300 160",
    '<rect width="300" height="160" fill="' + BG + '" rx="8"/>' +
      [
        [50, "正知"],
        [150, "正见"],
        [250, "正念"]
      ]
        .map(function (c) {
          return (
            '<rect x="' +
            (c[0] - 36) +
            '" y="36" width="72" height="88" rx="6" fill="rgba(196,165,116,0.12)" stroke="' +
            G +
            '"/>' +
            '<text x="' +
            c[0] +
            '" y="86" text-anchor="middle" fill="' +
            INK +
            '" font-size="13" font-family="sans-serif">' +
            c[1] +
            "</text>"
          );
        })
        .join("") +
      '<text x="150" y="148" text-anchor="middle" fill="' +
      DIM +
      '" font-size="11" font-family="sans-serif">看见是为了抱持</text>'
  );

  /* DISC：四象限 */
  D["disc"] = svg(
    "0 0 280 180",
    '<rect width="280" height="180" fill="' + BG + '" rx="8"/>' +
      '<line x1="140" y1="20" x2="140" y2="160" stroke="' +
      GD +
      '"/>' +
      '<line x1="30" y1="90" x2="250" y2="90" stroke="' +
      GD +
      '"/>' +
      [
        [80, 50, "D 支配"],
        [200, 50, "I 影响"],
        [80, 130, "C 谨慎"],
        [200, 130, "S 稳健"]
      ]
        .map(function (c) {
          return (
            '<text x="' +
            c[0] +
            '" y="' +
            c[1] +
            '" text-anchor="middle" fill="' +
            INK +
            '" font-size="13" font-family="sans-serif">' +
            c[2] +
            "</text>"
          );
        })
        .join("")
  );

  /* 九型：简化九边形 */
  D["enneagram"] = (function () {
    var cx = 150,
      cy = 95,
      r = 62;
    var pts = [];
    var labels = [];
    for (var i = 0; i < 9; i++) {
      var a = (-90 + i * 40) * (Math.PI / 180);
      var x = cx + r * Math.cos(a);
      var y = cy + r * Math.sin(a);
      pts.push(x.toFixed(1) + "," + y.toFixed(1));
      labels.push(
        '<circle cx="' +
          x.toFixed(1) +
          '" cy="' +
          y.toFixed(1) +
          '" r="10" fill="rgba(196,165,116,0.2)" stroke="' +
          G +
          '"/>' +
          '<text x="' +
          x.toFixed(1) +
          '" y="' +
          (y + 3.5).toFixed(1) +
          '" text-anchor="middle" fill="' +
          INK +
          '" font-size="10" font-family="sans-serif">' +
          (i + 1) +
          "</text>"
      );
    }
    return svg(
      "0 0 300 190",
      '<rect width="300" height="190" fill="' +
        BG +
        '" rx="8"/>' +
        '<polygon points="' +
        pts.join(" ") +
        '" fill="none" stroke="' +
        G +
        '" stroke-width="1.2"/>' +
        labels.join("") +
        '<text x="150" y="100" text-anchor="middle" fill="' +
        DIM +
        '" font-size="11" font-family="sans-serif">恐惧↔渴望</text>'
    );
  })();

  /* 冰山 */
  D["iceberg"] = svg(
    "0 0 280 220",
    '<rect width="280" height="220" fill="' + BG + '" rx="8"/>' +
      '<line x1="20" y1="70" x2="260" y2="70" stroke="' +
      GD +
      '" stroke-dasharray="4 3"/>' +
      '<text x="240" y="64" text-anchor="end" fill="' +
      DIM +
      '" font-size="10" font-family="sans-serif">水面</text>' +
      '<path d="M100 28 L180 28 L200 70 L80 70 Z" fill="rgba(196,165,116,0.25)" stroke="' +
      G +
      '"/>' +
      '<text x="140" y="55" text-anchor="middle" fill="' +
      INK +
      '" font-size="11" font-family="sans-serif">行为</text>' +
      [
        [80, "能力", 0.2],
        [108, "信念", 0.28],
        [136, "价值", 0.36],
        [164, "身份", 0.44],
        [192, "意义", 0.52]
      ]
        .map(function (row, i) {
          var inset = i * 8;
          return (
            '<path d="M' +
            (80 + inset) +
            " " +
            row[0] +
            " L" +
            (200 - inset) +
            " " +
            row[0] +
            " L" +
            (190 - inset) +
            " " +
            (row[0] + 24) +
            " L" +
            (90 + inset) +
            " " +
            (row[0] + 24) +
            ' Z" fill="rgba(196,165,116,' +
            row[2] +
            ')" stroke="' +
            G +
            '"/>' +
            '<text x="140" y="' +
            (row[0] + 16) +
            '" text-anchor="middle" fill="' +
            INK +
            '" font-size="11" font-family="sans-serif">' +
            row[1] +
            "</text>"
          );
        })
        .join("")
  );

  /* 原生家庭：五向度竖叠 */
  D["family-of-origin"] = svg(
    "0 0 320 210",
    '<rect width="320" height="210" fill="' + BG + '" rx="8"/>' +
      [
        ["1 原厂设置：原生家庭", 18],
        ["2 受教育经历", 56],
        ["3 文化层面", 94],
        ["4 阶级层面", 132],
        ["5 时代层面", 170]
      ]
        .map(function (row, i) {
          return (
            '<rect x="24" y="' +
            row[1] +
            '" width="272" height="32" rx="5" fill="rgba(196,165,116,' +
            (0.12 + i * 0.06).toFixed(2) +
            ')" stroke="' +
            G +
            '"/>' +
            '<text x="160" y="' +
            (row[1] + 21) +
            '" text-anchor="middle" fill="' +
            INK +
            '" font-size="12" font-family="sans-serif">' +
            row[0] +
            "</text>"
          );
        })
        .join("")
  );

  /* 客体关系：投射箭头 */
  D["object-relations"] = svg(
    "0 0 300 150",
    '<rect width="300" height="150" fill="' + BG + '" rx="8"/>' +
      '<circle cx="70" cy="75" r="32" fill="rgba(196,165,116,0.15)" stroke="' +
      G +
      '"/>' +
      '<text x="70" y="79" text-anchor="middle" fill="' +
      INK +
      '" font-size="11" font-family="sans-serif">我</text>' +
      '<circle cx="230" cy="75" r="32" fill="rgba(196,165,116,0.15)" stroke="' +
      G +
      '"/>' +
      '<text x="230" y="79" text-anchor="middle" fill="' +
      INK +
      '" font-size="11" font-family="sans-serif">TA</text>' +
      '<path d="M110 60 C150 40 190 40 230 60" fill="none" stroke="' +
      G +
      '" stroke-width="1.5" marker-end="url(#a)"/>' +
      '<path d="M230 90 C190 110 150 110 110 90" fill="none" stroke="' +
      DIM +
      '" stroke-width="1.5"/>' +
      '<text x="150" y="36" text-anchor="middle" fill="' +
      G +
      '" font-size="11" font-family="sans-serif">移情 / 投射</text>' +
      '<text x="150" y="128" text-anchor="middle" fill="' +
      DIM +
      '" font-size="11" font-family="sans-serif">反移情</text>'
  );

  /* 阴影：阴阳 */
  D["shadow"] = svg(
    "0 0 280 160",
    '<rect width="280" height="160" fill="' + BG + '" rx="8"/>' +
      '<circle cx="140" cy="80" r="50" fill="none" stroke="' +
      G +
      '" stroke-width="1.5"/>' +
      '<path d="M140 30 A50 50 0 0 1 140 130 A25 25 0 0 1 140 80 A25 25 0 0 0 140 30" fill="rgba(196,165,116,0.35)"/>' +
      '<circle cx="140" cy="55" r="6" fill="' +
      BG +
      '"/>' +
      '<circle cx="140" cy="105" r="6" fill="' +
      G +
      '"/>' +
      '<text x="50" y="84" text-anchor="middle" fill="' +
      INK +
      '" font-size="12" font-family="sans-serif">自我</text>' +
      '<text x="230" y="84" text-anchor="middle" fill="' +
      DIM +
      '" font-size="12" font-family="sans-serif">阴影</text>'
  );

  /* MBTI：四维 */
  D["mbti"] = svg(
    "0 0 300 170",
    '<rect width="300" height="170" fill="' + BG + '" rx="8"/>' +
      [
        ["E", "I", 28],
        ["S", "N", 62],
        ["T", "F", 96],
        ["J", "P", 130]
      ]
        .map(function (row) {
          return (
            '<text x="36" y="' +
            (row[2] + 4) +
            '" fill="' +
            INK +
            '" font-size="12" font-family="sans-serif">' +
            row[0] +
            "</text>" +
            '<line x1="56" y1="' +
            row[2] +
            '" x2="244" y2="' +
            row[2] +
            '" stroke="' +
            GD +
            '" stroke-width="2"/>' +
            '<circle cx="150" cy="' +
            row[2] +
            '" r="5" fill="' +
            G +
            '"/>' +
            '<text x="264" y="' +
            (row[2] + 4) +
            '" fill="' +
            INK +
            '" font-size="12" font-family="sans-serif">' +
            row[1] +
            "</text>"
          );
        })
        .join("") +
      '<text x="150" y="158" text-anchor="middle" fill="' +
      DIM +
      '" font-size="10" font-family="sans-serif">偏好光谱 · 非能力高下</text>'
  );

  /* 情绪天气 */
  D["emotion-weather"] = svg(
    "0 0 300 150",
    '<rect width="300" height="150" fill="' + BG + '" rx="8"/>' +
      '<rect x="24" y="30" width="110" height="90" rx="8" fill="rgba(196,165,116,0.12)" stroke="' +
      G +
      '"/>' +
      '<text x="79" y="70" text-anchor="middle" fill="' +
      INK +
      '" font-size="13" font-family="sans-serif">天气</text>' +
      '<text x="79" y="92" text-anchor="middle" fill="' +
      DIM +
      '" font-size="11" font-family="sans-serif">当下状态</text>' +
      '<rect x="166" y="30" width="110" height="90" rx="8" fill="rgba(196,165,116,0.2)" stroke="' +
      G +
      '"/>' +
      '<text x="221" y="70" text-anchor="middle" fill="' +
      INK +
      '" font-size="13" font-family="sans-serif">气候</text>' +
      '<text x="221" y="92" text-anchor="middle" fill="' +
      DIM +
      '" font-size="11" font-family="sans-serif">稳定特质</text>'
  );

  /* 人生脚本：时间线 */
  D["life-script"] = svg(
    "0 0 320 130",
    '<rect width="320" height="130" fill="' + BG + '" rx="8"/>' +
      '<line x1="30" y1="70" x2="290" y2="70" stroke="' +
      G +
      '" stroke-width="1.5"/>' +
      [50, 110, 170, 230, 280]
        .map(function (x, i) {
          return (
            '<circle cx="' +
            x +
            '" cy="70" r="8" fill="' +
            BG +
            '" stroke="' +
            G +
            '" stroke-width="1.5"/>' +
            '<text x="' +
            x +
            '" y="48" text-anchor="middle" fill="' +
            INK +
            '" font-size="10" font-family="sans-serif">记忆' +
            (i + 1) +
            "</text>"
          );
        })
        .join("") +
      '<text x="160" y="110" text-anchor="middle" fill="' +
      DIM +
      '" font-size="11" font-family="sans-serif">叙事主题 → 可改写意义</text>'
  );

  /* 关爱：五瓣 */
  D["love-care"] = svg(
    "0 0 300 170",
    '<rect width="300" height="170" fill="' + BG + '" rx="8"/>' +
      '<circle cx="150" cy="88" r="22" fill="rgba(196,165,116,0.25)" stroke="' +
      G +
      '"/>' +
      '<text x="150" y="92" text-anchor="middle" fill="' +
      INK +
      '" font-size="11" font-family="sans-serif">关爱</text>' +
      [
        [150, 28, "言语"],
        [230, 60, "时间"],
        [210, 130, "礼物"],
        [90, 130, "服务"],
        [70, 60, "接触"]
      ]
        .map(function (t) {
          return (
            '<circle cx="' +
            t[0] +
            '" cy="' +
            t[1] +
            '" r="20" fill="rgba(196,165,116,0.12)" stroke="' +
            G +
            '"/>' +
            '<text x="' +
            t[0] +
            '" y="' +
            (t[1] + 4) +
            '" text-anchor="middle" fill="' +
            INK +
            '" font-size="11" font-family="sans-serif">' +
            t[2] +
            "</text>"
          );
        })
        .join("")
  );

  /* 八字五行 */
  D["bazi-lens"] = svg(
    "0 0 280 160",
    '<rect width="280" height="160" fill="' + BG + '" rx="8"/>' +
      [
        [140, 36, "火"],
        [210, 80, "土"],
        [175, 130, "金"],
        [105, 130, "水"],
        [70, 80, "木"]
      ]
        .map(function (t) {
          return (
            '<circle cx="' +
            t[0] +
            '" cy="' +
            t[1] +
            '" r="22" fill="rgba(196,165,116,0.14)" stroke="' +
            G +
            '"/>' +
            '<text x="' +
            t[0] +
            '" y="' +
            (t[1] + 4) +
            '" text-anchor="middle" fill="' +
            INK +
            '" font-size="13" font-family="sans-serif">' +
            t[2] +
            "</text>"
          );
        })
        .join("") +
      '<text x="140" y="88" text-anchor="middle" fill="' +
      DIM +
      '" font-size="10" font-family="sans-serif">象征</text>'
  );

  /* 人类图：简化能量 */
  D["human-design-lens"] = svg(
    "0 0 280 150",
    '<rect width="280" height="150" fill="' + BG + '" rx="8"/>' +
      '<rect x="40" y="30" width="60" height="90" rx="8" fill="rgba(196,165,116,0.12)" stroke="' +
      G +
      '"/>' +
      '<text x="70" y="80" text-anchor="middle" fill="' +
      INK +
      '" font-size="11" font-family="sans-serif">类型</text>' +
      '<rect x="110" y="30" width="60" height="90" rx="8" fill="rgba(196,165,116,0.18)" stroke="' +
      G +
      '"/>' +
      '<text x="140" y="80" text-anchor="middle" fill="' +
      INK +
      '" font-size="11" font-family="sans-serif">策略</text>' +
      '<rect x="180" y="30" width="60" height="90" rx="8" fill="rgba(196,165,116,0.24)" stroke="' +
      G +
      '"/>' +
      '<text x="210" y="80" text-anchor="middle" fill="' +
      INK +
      '" font-size="11" font-family="sans-serif">权威</text>'
  );

  /* 星盘：简化圆 */
  D["astrology-lens"] = svg(
    "0 0 200 200",
    '<rect width="200" height="200" fill="' + BG + '" rx="8"/>' +
      '<circle cx="100" cy="100" r="70" fill="none" stroke="' +
      G +
      '" stroke-width="1.2"/>' +
      '<circle cx="100" cy="100" r="40" fill="none" stroke="' +
      GD +
      '"/>' +
      '<line x1="100" y1="30" x2="100" y2="170" stroke="' +
      GD +
      '"/>' +
      '<line x1="30" y1="100" x2="170" y2="100" stroke="' +
      GD +
      '"/>' +
      '<text x="100" y="104" text-anchor="middle" fill="' +
      INK +
      '" font-size="12" font-family="sans-serif">象征</text>'
  );

  window.KB_DIAGRAMS = D;

  function attach() {
    if (!window.KB_MODULES) return;
    window.KB_MODULES.forEach(function (m) {
      if (D[m.id]) m.diagram = D[m.id];
    });
    if (window.KB_BY_ID) {
      Object.keys(window.KB_BY_ID).forEach(function (id) {
        if (D[id]) window.KB_BY_ID[id].diagram = D[id];
      });
    }
  }

  attach();
  window.KB_attachDiagrams = attach;
})();
