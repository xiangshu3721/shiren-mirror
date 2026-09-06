/**
 * 知人镜 · 线下推理引擎（规则 / 启发式 + 模板）
 *
 * Modes:
 *   recommend — 推荐用什么模型（透镜与用法）
 *   analyze   — 直接按框架分析（假设待验证）
 *
 * ---------------------------------------------------------------------------
 * AI GATEWAY HOOK (plug later):
 *   Replace or augment synthesize / lensApply with a call to your trusted
 *   backend AI gateway. Keep ethics.check() as a mandatory pre-filter on the
 *   client AND re-validate on the server. Never put OpenAI/API keys in frontend.
 * ---------------------------------------------------------------------------
 */
(function (global) {
  "use strict";

  function tokenize(text) {
    var s = String(text || "").toLowerCase();
    var parts = s.split(/[\s,，。！？、；：:;!?./\\|()\[\]{}「」『』""''《》\n\r\t]+/);
    var out = [];
    for (var i = 0; i < parts.length; i++) {
      if (parts[i] && parts[i].length >= 1) out.push(parts[i]);
    }
    var han = s.replace(/[^\u4e00-\u9fff]/g, " ");
    var chars = han.replace(/\s+/g, "");
    for (var j = 0; j < chars.length - 1; j++) {
      out.push(chars.substr(j, 2));
    }
    return out;
  }

  function scoreModule(mod, tokens, blob) {
    var score = 0;
    var why = [];
    var fields = [].concat(mod.tags || [], mod.askHints || [], [mod.name, mod.summary]);
    for (var i = 0; i < fields.length; i++) {
      var f = String(fields[i]).toLowerCase();
      if (!f) continue;
      if (blob.indexOf(f) !== -1) {
        score += 3;
        if (why.length < 3) why.push("命中「" + fields[i] + "」");
        continue;
      }
      for (var t = 0; t < tokens.length; t++) {
        if (tokens[t].length >= 2 && f.indexOf(tokens[t]) !== -1) {
          score += 1;
          break;
        }
      }
    }
    if (mod.tier === "A") score += 0.5;
    if (mod.tier === "C") score -= 0.3;
    return { id: mod.id, score: score, why: why, mod: mod };
  }

  /**
   * @param {string} person
   * @param {string} intent
   * @param {object} ethics
   * @param {{ max?: number, forRecommend?: boolean }} opts
   */
  function pickModules(person, intent, ethics, opts) {
    opts = opts || {};
    var max = opts.max || (opts.forRecommend ? 5 : 4);
    var blob = (person + " " + intent).toLowerCase();
    var tokens = tokenize(blob);
    var modules = global.KB_MODULES || [];
    var scored = modules.map(function (m) {
      return scoreModule(m, tokens, blob);
    });
    scored.sort(function (a, b) {
      return b.score - a.score;
    });

    var chosen = [];
    var ids = {};

    function add(id, reason) {
      if (ids[id]) return;
      var m = global.KB_BY_ID[id];
      if (!m) return;
      ids[id] = true;
      chosen.push({ mod: m, reason: reason });
    }

    add("six-layer", "核心框架：建立可验证假设");
    add("hold-ethic", "伦理底座：看见为了抱持");

    if (/防骗|信任|合作|投资|借钱|骗子|靠谱|红旗|担保/.test(blob)) {
      add("anti-fraud", "诉求涉及信任 / 金钱 / 合作校准");
    }

    for (var i = 0; i < scored.length && chosen.length < max; i++) {
      if (scored[i].score <= 0.5) continue;
      if (ids[scored[i].id]) continue;
      var reason = scored[i].why.length
        ? scored[i].why.join("；")
        : "与描述关键词相关";
      add(scored[i].id, reason);
    }

    if (chosen.length < 2) {
      add("attachment", "关系情境常用透镜");
      add("eight-motives", "理解驱动与底线");
    }
    return chosen.slice(0, max);
  }

  function buildHypotheses(person, intent, chosen) {
    var blob = person + intent;
    var hyps = [];

    if (/冷淡|已读不回|疏远|不回消息|抽离/.test(blob)) {
      hyps.push({
        p: "中高",
        text: "对方可能正用「拉开距离」调节亲密压力（回避或暂时过载），而非单纯「不在乎」。需验证：独处后是否能温和重连。"
      });
    }
    if (/黏|不安|确认|分手|焦虑|怕被弃/.test(blob)) {
      hyps.push({
        p: "中",
        text: "关系里或许激活了焦虑依恋：对距离过度敏感，核心需要是可预期的回应与被珍视感。"
      });
    }
    if (/借钱|投资|合作|催|限时|回报|担保/.test(blob)) {
      hyps.push({
        p: "中高",
        text: "金钱/承诺/时间压力可能同时出现——需优先做信任校准，而非先解释人格动机。"
      });
    }
    if (/讨好|道歉|不敢拒绝|怕冲突/.test(blob)) {
      hyps.push({
        p: "中",
        text: "讨好可能是换取安全与关系的防御；表层顺从下或许是羞耻或被弃恐惧。验证：拒绝后是否有惩罚性反应。"
      });
    }
    if (/控制|发脾气|挑剔|完美/.test(blob)) {
      hyps.push({
        p: "中",
        text: "控制或完美要求，可能在对抗失控恐惧或羞耻；「过度即防御」。验证：在低利害情境是否仍同样用力。"
      });
    }
    if (/吵架|冲突|矛盾|冷战/.test(blob)) {
      hyps.push({
        p: "中",
        text: "冲突可能是未被满足的核心需要（被看见/自主/尊重）穿上了攻击或撤退的外衣。"
      });
    }
    if (/原生|爸|妈|家/.test(blob)) {
      hyps.push({
        p: "中低",
        text: "当下反应或带有原生脚本回声（移情）。需区分「对方是谁」与「TA 像旧客体的谁」。"
      });
    }

    if (hyps.length < 2) {
      hyps.push({
        p: "中",
        text: "对方当下行为服务于某个即时目的（求安全、求认可、保自主或避羞耻）。用「三问」探：怕什么、护什么、需要什么。"
      });
    }
    if (hyps.length < 3) {
      hyps.push({
        p: "中低",
        text: "反应强度若远超事件本身，可能触到早期脚本；此时宜放慢，先稳住关系安全再谈深层。"
      });
    }
    return hyps.slice(0, 3);
  }

  function buildClues(person, intent) {
    var clues = [
      "在至少两个不同情境下，观察对方言行是否一致（对你 / 对他人 / 对利益）。",
      "温和提问：「当你……的时候，你最担心的是什么？」听内容也听回避点。",
      "做一个小边界实验（温和说不或推迟决定），看对方修复方式：尊重、协商，还是惩罚、道德绑架。"
    ];
    var blob = person + intent;
    if (/借钱|投资|合作/.test(blob)) {
      clues.push("要求可核实信息与冷静期；异常催促本身即是信号。");
    }
    if (/恋爱|交往|伴侣|喜欢/.test(blob)) {
      clues.push("观察冲突后的修复：是否承认影响、是否有具体改变，而非只有甜言。");
    }
    if (/沟通|说话|表达/.test(blob)) {
      clues.push("尝试调整信息包装（先要点或先共情），看误解是否下降——区分「人不合」与「编码不合」。");
    }
    return clues.slice(0, 5);
  }

  function buildHoldTips(intent, chosen) {
    var tips = [
      "用「我注意到……我在想是不是……」代替定性标签；给对方否认与修正的空间。",
      "先回应可能的核心需要（安全、被看见、自主），再谈具体事项。",
      "守住你的边界：理解对方 ≠ 答应伤害自己的条件。"
    ];
    var ids = chosen.map(function (c) { return c.mod.id; });
    if (ids.indexOf("love-care") !== -1 || /支持|爱|关心|抱持/.test(intent)) {
      tips.push("问清对方「觉得被支持」的具体样子，小剂量给予并看反馈。");
    }
    if (ids.indexOf("disc") !== -1) {
      tips.push("按对方沟通偏好调整节奏与细节量，目标是被听懂，不是赢。");
    }
    if (ids.indexOf("anti-fraud") !== -1) {
      tips.push("自保时语气仍可尊重：暂缓、核实、书面化——保护自己不是审判。");
    }
    return tips.slice(0, 4);
  }

  function rightViewLine(ethics, intent) {
    if (ethics.status === "soft") {
      return "先校准意图：从「让对方按我的意愿行动」转向「看清匹配、真诚表达、彼此自由」。";
    }
    if (/防骗|信任|借钱|投资|合作/.test(intent)) {
      return "正见：保护自己是责任；清醒的慈悲包含说不的能力。";
    }
    if (/支持|帮|抱持|理解/.test(intent)) {
      return "正见：看见是为了抱持；帮助有边界，你不是对方的拯救者。";
    }
    return "正见：假设而非标签；概率而非定论；理解对方，也忠于自己的边界。";
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function snippet(text, maxLen) {
    var s = String(text || "").replace(/\s+/g, " ").trim();
    if (s.length <= maxLen) return s;
    return s.slice(0, maxLen - 1) + "…";
  }

  /* —— Recommend helpers —— */

  function observePoints(mod, blob) {
    var pts = [];
    var cp = mod.corePoints || [];
    for (var i = 0; i < cp.length && pts.length < 3; i++) {
      pts.push(cp[i]);
    }
    if (pts.length < 3 && mod.howToUse && mod.howToUse.length) {
      for (var j = 0; j < mod.howToUse.length && pts.length < 3; j++) {
        pts.push(mod.howToUse[j]);
      }
    }
    while (pts.length < 3) {
      pts.push("在具体情境中记录言行，避免一次下定论。");
    }

    // Light keyword tailoring
    if (mod.id === "anti-fraud" && /催|限时|投资|借钱/.test(blob)) {
      pts[0] = "催促节奏与「必须本周决定」等时间压力是否反复出现";
      pts[1] = "口头承诺多、可核实书面材料少时的缺口";
      pts[2] = "对方对质疑、暂缓、第三方核实的反应（尊重还是道德绑架）";
    }
    if (mod.id === "attachment" && /冷淡|疏远|黏|焦虑|已读不回/.test(blob)) {
      pts[0] = "距离变化时：对方是主动拉开、追问确认，还是交替两者";
      pts[1] = "重连后修复质量：能否承认影响，还是只快速和好";
      pts[2] = "你设温和边界后，对方是协商还是惩罚性撤退";
    }
    if (mod.id === "six-layer") {
      pts[0] = "先忠实记下具体言行与情境（行为层），暂不做人格判决";
      pts[1] = "猜测即时目的与可能恐惧，各写 1–2 条可证伪假设";
      pts[2] = "跨至少两个情境核对：同一模式是否重复出现";
    }
    return pts.slice(0, 3);
  }

  function howToApply(mod, person, intent, blob) {
    var tips = [];
    var shortP = snippet(person, 36);
    var shortI = snippet(intent, 28);

    if (mod.id === "six-layer") {
      tips.push("针对「" + shortP + "」，先只立 2–3 个六层假设（如即时目的 / 防御 / 需要），标上概率。");
      tips.push("结合你的诉求「" + shortI + "」，设计 1 个温和验证问题，再决定是否深入脚本层。");
    } else if (mod.id === "anti-fraud") {
      tips.push("把信任与合作拆成可核实清单：信息、冷静期、书面条款——先过红旗，再谈人格理解。");
      tips.push("自保动作（暂缓、核实）用尊重语气表达；观察对方是否允许你说不。");
    } else if (mod.id === "hold-ethic") {
      tips.push("每次解读前问：我看见这些，是为了抱持与自保，还是为了赢 / 操控？");
      tips.push("允许自己不懂、暂缓结论；理解对方 ≠ 答应伤害自己的条件。");
    } else if (mod.id === "attachment") {
      tips.push("把描述里的距离/黏/冷淡当成依恋策略线索，而非道德好坏。");
      tips.push("用可预期的小回应做实验，看安全感是否上升，再谈深层议题。");
    } else if (mod.id === "eight-motives") {
      tips.push("从描述中圈出对方最用力的点，猜测主导动机（安全/价值/自主等）与冲突动机。");
      tips.push("沟通时先对准可能被威胁的动机，再谈具体事项。");
    } else {
      var how = (mod.howToUse && mod.howToUse[0]) || "对照模块要点，在本案写下一两条可观察线索。";
      tips.push("本案可先用：「" + snippet(how, 48) + "」");
      tips.push("带着诉求「" + shortI + "」阅读模块适用场景与误用边界，避免过度解读。");
    }
    return tips.slice(0, 2);
  }

  function orderSuggestion(chosen) {
    var ids = chosen.map(function (c) { return c.mod.id; });
    var steps = [];
    if (ids.indexOf("anti-fraud") !== -1) {
      steps.push("先过「防骗 / 信任校准」：有红旗则优先自保，再谈深层人格。");
    }
    if (ids.indexOf("hold-ethic") !== -1) {
      steps.push("稳住「抱持伦理」：明确看见的目的是理解与边界，不是操控。");
    }
    if (ids.indexOf("six-layer") !== -1) {
      steps.push("用「六层」立可验证假设，一次 2–4 条，标概率。");
    }
    var rest = chosen.filter(function (c) {
      return ["anti-fraud", "hold-ethic", "six-layer"].indexOf(c.mod.id) === -1;
    });
    if (rest.length) {
      steps.push(
        "再叠加「" +
          rest
            .map(function (c) { return c.mod.name; })
            .join("、") +
          "」细化观察。"
      );
    }
    return steps;
  }

  function renderRecommend(person, intent, ethics, chosen) {
    var blob = person + intent;
    var h = "";
    if (ethics.crisis) {
      h += '<div class="banner banner-crisis" role="alert">若你或对方处于危机（自伤、他伤、家暴等），请优先联系当地紧急服务或专业心理危机热线。本工具不能替代专业帮助。</div>';
    }
    if (ethics.message) {
      h += '<div class="banner banner-soft" role="status">' + escapeHtml(ethics.message) + "</div>";
    }

    h += '<section class="result-block result-recommend"><h3>正见校准</h3><p class="lead">' +
      escapeHtml(rightViewLine(ethics, intent)) +
      "</p></section>";

    h += '<section class="result-block result-recommend"><h3>模型推荐</h3>';
    h += '<p class="lead">根据你的描述，建议优先用这些模型作透镜——先学会「看什么、怎么用」，再决定是否做直接分析。</p>';

    chosen.forEach(function (L, idx) {
      var obs = observePoints(L.mod, blob);
      var apply = howToApply(L.mod, person, intent, blob);
      h += '<article class="recommend-card">';
      h += '<h4><span class="recommend-idx">' + (idx + 1) + "</span> " +
        '<a href="module.html?id=' + encodeURIComponent(L.mod.id) + '">' +
        escapeHtml(L.mod.name) + "</a></h4>";
      h += '<p class="recommend-why"><strong>为何适合本案：</strong>' + escapeHtml(L.reason) + "</p>";
      h += '<p class="muted tiny">' + escapeHtml(L.mod.summary || "") + "</p>";
      h += "<p><strong>观察点</strong></p><ul>";
      obs.forEach(function (o) {
        h += "<li>" + escapeHtml(o) + "</li>";
      });
      h += "</ul>";
      h += "<p><strong>对本案怎么用</strong></p><ul>";
      apply.forEach(function (a) {
        h += "<li>" + escapeHtml(a) + "</li>";
      });
      h += "</ul>";
      h += '<p class="recommend-link"><a class="btn btn-ghost" href="module.html?id=' +
        encodeURIComponent(L.mod.id) + '">打开「' + escapeHtml(L.mod.name) + "」详解</a></p>";
      h += "</article>";
    });
    h += "</section>";

    var order = orderSuggestion(chosen);
    if (order.length) {
      h += '<section class="result-block result-recommend"><h3>使用顺序建议</h3><ol>';
      order.forEach(function (s) {
        h += "<li>" + escapeHtml(s) + "</li>";
      });
      h += "</ol></section>";
    }

    h +=
      '<section class="result-block result-recommend"><h3>下一步</h3>' +
      "<p>若你已熟悉上述透镜，可切换到「<strong>直接帮我分析</strong>」模式，让引擎按框架给出对待验证的解读。" +
      "仍请记住：假设待验证，不是定论。</p></section>";

    h +=
      '<section class="result-block"><h3>边界提醒</h3><ul>' +
      "<li>本模式只推荐透镜与用法，不代替你对真人做判断。</li>" +
      "<li>未经验证的假设不可当作指控或人格判决。</li>" +
      "<li>本结果由线下启发式引擎生成，非医疗或心理诊断。</li>" +
      "</ul></section>";

    return h;
  }

  /* —— Analyze helpers —— */

  function applyLensToCase(mod, person, intent, blob) {
    var shortP = snippet(person, 42);
    var sentences = [];

    if (mod.id === "six-layer") {
      sentences.push("就你描述的「" + shortP + "」，六层建议先钉在行为层：把催促、口头细节、书面缺口等写成可核对事实，暂不贴「骗子/好人」标签。");
      if (/催|限时|投资|借钱|合作/.test(blob)) {
        sentences.push("即时目的层可立假设（概率中高）：对方或在推动快速承诺，以降低你核实与反悔的空间——需用冷静期与书面材料验证，而非先猜性格。");
        sentences.push("防御/需要层暂缓深入：若红旗成立，优先自保；若核实后仍可信，再探其恐惧（如怕失去机会）与需要（被信任/掌控感）。");
      } else if (/冷淡|疏远|已读不回|黏|焦虑/.test(blob)) {
        sentences.push("即时目的与防御层：拉开距离或反复确认，可能在调节亲密压力或求可预期回应——用「独处后能否温和重连」验证。");
        sentences.push("核心需要层假设（概率中）：安全与被珍视感可能比「对错」更能解释当下拉扯；冲突高峰不宜跳到早期脚本。");
      } else {
        sentences.push("对即时目的、恐惧、防御各写 1 条可证伪假设，标概率；跨两个情境核对后再谈脚本层。");
        sentences.push("三问可用：「对方在怕什么？护什么？真正需要什么？」——答案是假设，留给对方修正。");
      }
    } else if (mod.id === "anti-fraud") {
      sentences.push("信任校准透镜看本案：时间压力 + 口头丰富 + 书面稀缺，是常见高风险组合（假设待验证，非定罪）。");
      sentences.push("建议把「是否合作」拆成可观察红旗清单：可核实信息、第三方背书、允许暂缓、拒绝后的态度。");
      sentences.push("若对方将质疑视为不忠或道德绑架，这本身就是强信号；自保与珍惜友谊可以并存。");
    } else if (mod.id === "hold-ethic") {
      sentences.push("抱持伦理提醒：你的诉求若含防骗与友谊，二者不是对立——清醒的慈悲包括说不。");
      sentences.push("看见对方的可能动机，是为了选择匹配的沟通与边界，而不是为了赢一场道德审判。");
    } else if (mod.id === "attachment") {
      sentences.push("依恋透镜：描述中的距离/黏着/冷淡，更宜看作调节亲密的策略，而非单纯好坏。");
      if (/冷淡|疏远|已读不回/.test(blob)) {
        sentences.push("回避型调节的可能（概率中）：用抽离降压；验证点是压力过后能否主动、温和地重连。");
      } else if (/黏|焦虑|确认|怕/.test(blob)) {
        sentences.push("焦虑型激活的可能（概率中）：对不确定过度敏感；需要的是可预期小回应，而非一次说清「永远」。");
      } else {
        sentences.push("观察你们冲突—修复循环：修复质量往往比冲突频率更能预测关系安全感。");
      }
    } else if (mod.id === "eight-motives") {
      sentences.push("八动机透镜：从「" + shortP + "」中找对方最用力处——可能是安全（可控）、价值（被认可）或权力（主导决策节奏）。");
      sentences.push("若多种动机冲突（如要关系又要自主），行为会显得矛盾；沟通时可先对准被威胁的那一动机。");
    } else if (mod.id === "disc") {
      sentences.push("沟通风格透镜：误解有时来自编码节奏（要点优先 vs 细节铺陈），未必是人品问题。");
      sentences.push("可试一次「先共情要点再补细节」或相反，看摩擦是否下降，从而区分风格差与价值观差。");
    } else {
      var sum = mod.summary || "用本模块要点对照本案。";
      sentences.push("以「" + mod.name + "」看本案：" + snippet(sum, 60));
      sentences.push("结合你的诉求，挑选 1–2 条模块要点，写成针对「" + shortP + "」的观察假设，并设计验证窗口。");
      if (mod.tier === "C") {
        sentences.push("注意：本模块属文化/象征透镜，仅供启发，不作科学证据或宿命论断。");
      }
    }

    return sentences.slice(0, 4);
  }

  function renderAnalyze(person, intent, ethics, chosen) {
    var blob = person + intent;
    var h = "";
    if (ethics.crisis) {
      h += '<div class="banner banner-crisis" role="alert">若你或对方处于危机（自伤、他伤、家暴等），请优先联系当地紧急服务或专业心理危机热线。本工具不能替代专业帮助。</div>';
    }
    if (ethics.message) {
      h += '<div class="banner banner-soft" role="status">' + escapeHtml(ethics.message) + "</div>";
    }

    h += '<div class="banner banner-soft" role="note"><strong>假设待验证</strong> — 以下解读按框架应用于你的描述，使用概率语言，不是诊断、不是标签事实，更不是操控手册。</div>';

    h += '<section class="result-block result-analyze"><h3>正见校准</h3><p class="lead">' +
      escapeHtml(rightViewLine(ethics, intent)) +
      "</p></section>";

    h += '<section class="result-block result-analyze"><h3>选用框架</h3><ul class="lens-list">';
    chosen.forEach(function (L) {
      h +=
        "<li><a href=\"module.html?id=" +
        encodeURIComponent(L.mod.id) +
        '">' +
        escapeHtml(L.mod.name) +
        "</a><span class=\"muted\"> — " +
        escapeHtml(L.reason) +
        "</span></li>";
    });
    h += "</ul></section>";

    h += '<section class="result-block result-analyze"><h3>分框架解读</h3>';
    h += '<p class="muted tiny">每个透镜单独看本案；交叉印证后再形成整体印象。</p>';
    chosen.forEach(function (L) {
      var paras = applyLensToCase(L.mod, person, intent, blob);
      h += '<article class="analyze-lens">';
      h += "<h4><a href=\"module.html?id=" + encodeURIComponent(L.mod.id) + '">' +
        escapeHtml(L.mod.name) + "</a></h4>";
      paras.forEach(function (p) {
        h += "<p>" + escapeHtml(p) + "</p>";
      });
      h += "</article>";
    });
    h += "</section>";

    var hyps = buildHypotheses(person, intent, chosen);
    h += '<section class="result-block result-analyze"><h3>六层假设</h3><p class="muted tiny">以下为待验证的概率假设，不是定论。</p><ol>';
    hyps.forEach(function (hp) {
      h +=
        "<li><span class=\"tag-prob\">概率 " +
        escapeHtml(hp.p) +
        "</span> " +
        escapeHtml(hp.text) +
        "</li>";
    });
    h += "</ol></section>";

    var clues = buildClues(person, intent);
    h += '<section class="result-block result-analyze"><h3>验证问题</h3><ol>';
    clues.forEach(function (c) {
      h += "<li>" + escapeHtml(c) + "</li>";
    });
    h += "</ol></section>";

    var hold = buildHoldTips(intent, chosen);
    h += '<section class="result-block result-analyze"><h3>抱持 / 沟通建议</h3><ul>';
    hold.forEach(function (t) {
      h += "<li>" + escapeHtml(t) + "</li>";
    });
    h += "</ul></section>";

    h +=
      '<section class="result-block result-analyze"><h3>边界提醒</h3><ul>' +
      "<li>未经验证的假设不可当作指控或人格判决。</li>" +
      "<li>状态≠特质；糟糕的一天不能定义一个人。</li>" +
      "<li>文化/象征透镜（若选用）仅供启发，不作科学证据或宿命论断。</li>" +
      "<li>本结果由线下启发式引擎生成，非医疗或心理诊断。</li>" +
      "</ul></section>";

    return h;
  }

  function emptyResult() {
    return {
      ok: false,
      kind: "empty",
      html:
        '<div class="banner banner-empty" role="status">再多写一点具体就好——例如对方近期的一句原话、一个场景，以及你真正想看清或守住的是什么。细节越多，透镜越准。</div>'
    };
  }

  function rejectResult(ethics) {
    return {
      ok: false,
      kind: "reject",
      html:
        '<div class="banner banner-reject" role="alert"><strong>未通过正见门禁</strong><p>' +
        escapeHtml(ethics.message) +
        "</p><p class=\"muted\">知人镜存在的意义是：避免被欺、理解关系、以慈悲抱持——而非操控与伤害。</p></div>"
    };
  }

  /**
   * @param {string} personText
   * @param {string} intentText
   * @param {'recommend'|'analyze'} [mode]
   */
  function runAsk(personText, intentText, mode) {
    var person = String(personText || "").trim();
    var intent = String(intentText || "").trim();
    mode = mode === "recommend" ? "recommend" : "analyze";

    if (person.length + intent.length < 12) {
      return emptyResult();
    }

    var ethics = global.Ethics.check(person, intent);
    if (ethics.status === "reject") {
      return rejectResult(ethics);
    }

    var effectiveIntent = ethics.reframedIntent || intent;
    var forRecommend = mode === "recommend";
    var lenses = pickModules(person, effectiveIntent, ethics, {
      forRecommend: forRecommend,
      max: forRecommend ? 5 : 4
    });

    var html =
      mode === "recommend"
        ? renderRecommend(person, effectiveIntent, ethics, lenses)
        : renderAnalyze(person, effectiveIntent, ethics, lenses);

    return {
      ok: true,
      kind: mode === "recommend" ? "recommend" : "analyze",
      mode: mode,
      html: html,
      data: {
        mode: mode,
        rightView: rightViewLine(ethics, effectiveIntent),
        lenses: lenses,
        softMessage: ethics.message || "",
        crisis: !!ethics.crisis
      }
    };
  }

  global.AskEngine = {
    run: runAsk,
    pickModules: pickModules,
    renderRecommend: renderRecommend,
    renderAnalyze: renderAnalyze
  };
})(window);
