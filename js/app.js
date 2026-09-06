/**
 * 知人镜 · 共享 UI 逻辑
 */
(function () {
  "use strict";

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }
  function qsa(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function getQueryParam(name) {
    var m = new RegExp("[?&]" + name + "=([^&]*)").exec(window.location.search);
    return m ? decodeURIComponent(m[1].replace(/\+/g, " ")) : "";
  }

  function setActiveNav() {
    var path = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
    qsa(".nav a").forEach(function (a) {
      var href = (a.getAttribute("href") || "").toLowerCase();
      if (href === path || (path === "" && href === "index.html")) {
        a.setAttribute("aria-current", "page");
      }
    });
  }

  function tierLabel(t) {
    if (t === "A") return "核心";
    if (t === "B") return "框架";
    return "文化透镜";
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }


  /** Split numbered prose ("1）…2）…") into step strings; arrays pass through. */
  function toSteps(val) {
    if (Array.isArray(val)) {
      return val.map(function (x) { return String(x).trim(); }).filter(Boolean);
    }
    if (val == null) return [];
    var s = String(val).trim();
    if (!s) return [];
    if (s.indexOf("\n") !== -1) {
      return s.split(/\n+/).map(function (x) { return x.replace(/^\d+[）\)\.、]\s*/, "").trim(); }).filter(Boolean);
    }
    var hasNum = /\d+[）\)\.、]/.test(s);
    if (hasNum) {
      return s
        .split(/(?=\d+[）\)\.、])/)
        .map(function (x) { return x.replace(/^\d+[）\)\.、]\s*/, "").replace(/[；;。]\s*$/, "").trim(); })
        .filter(Boolean);
    }
    if (/[；;]/.test(s) && s.split(/[；;]/).length >= 2) {
      return s.split(/[；;]/).map(function (x) { return x.replace(/[。]\s*$/, "").trim(); }).filter(Boolean);
    }
    return [s];
  }

  function renderDiagram(mod) {
    var svg = mod.diagram || (window.KB_DIAGRAMS && window.KB_DIAGRAMS[mod.id]);
    if (!svg || typeof svg !== "string") return "";
    if (/<script/i.test(svg)) return "";
    return (
      '<figure class="module-diagram">' +
      svg +
      "<figcaption>结构图</figcaption>" +
      "</figure>"
    );
  }


  function renderModuleDetail(container, id) {
    if (!container) return;
    var mod = window.KB_BY_ID && window.KB_BY_ID[id];
    if (!mod) {
      container.innerHTML =
        '<div class="banner banner-reject" role="alert">未找到该模块。<a href="kb.html">返回知识库</a></div>';
      return;
    }
    document.title = mod.name + " · 知人镜";

    function list(arr, ordered) {
      if (!arr || !arr.length) return "<p class=\"muted\">暂无</p>";
      var tag = ordered ? "ol" : "ul";
      return (
        "<" +
        tag +
        ">" +
        arr
          .map(function (x) {
            return "<li>" + escapeHtml(x) + "</li>";
          })
          .join("") +
        "</" +
        tag +
        ">"
      );
    }

    var tierNote =
      mod.tier === "C"
        ? '<p class="banner banner-soft" role="note">本模块为<strong>文化 / 象征透镜</strong>，仅供启发，禁止宿命论断，不作科学证据。</p>'
        : "";

    function renderExplainBlocks(blocks) {
      if (!blocks || !blocks.length) return "";
      return blocks
        .map(function (b) {
          if (!b || typeof b !== "object") return "";
          var html = "";
          if (b.h) html += "<h3>" + escapeHtml(b.h) + "</h3>";
          if (b.p) html += "<p>" + escapeHtml(b.p) + "</p>";
          if (b.items && b.items.length) {
            html +=
              "<ul>" +
              b.items
                .map(function (x) {
                  return "<li>" + escapeHtml(x) + "</li>";
                })
                .join("") +
              "</ul>";
          }
          return html;
        })
        .join("");
    }

    var explainHtml;
    if (mod.explainBlocks && mod.explainBlocks.length) {
      explainHtml = renderExplainBlocks(mod.explainBlocks);
    } else {
      var explainSteps = toSteps(mod.explain);
      if (explainSteps.length > 1 && /\d+[）\)\.、]/.test(String(mod.explain || ""))) {
        explainHtml = list(explainSteps, true);
      } else if (Array.isArray(mod.explain)) {
        explainHtml = list(mod.explain, false);
      } else {
        explainHtml = "<p>" + escapeHtml(mod.explain || "") + "</p>";
      }
    }

    var howSteps = toSteps(mod.howToUse);
    var howHtml = howSteps.length ? list(howSteps, true) : '<p class="muted">暂无</p>';

    container.innerHTML =
      '<article class="module-article">' +
      '<p class="breadcrumb"><a href="kb.html">知识库</a> / <span>' +
      escapeHtml(mod.name) +
      "</span></p>" +
      '<header class="module-header">' +
      '<div class="card-meta"><span class="pill">' +
      tierLabel(mod.tier) +
      '</span><span class="pill soft">' +
      escapeHtml(mod.category) +
      "</span></div>" +
      "<h1>" +
      escapeHtml(mod.name) +
      "</h1>" +
      '<p class="lead">' +
      escapeHtml(mod.summary) +
      "</p>" +
      "</header>" +
      tierNote +
      renderDiagram(mod) +
      '<section class="result-block"><h2>核心要点</h2>' +
      list(mod.corePoints, true) +
      "</section>" +
      '<section class="result-block"><h2>内容解释</h2>' +
      explainHtml +
      "</section>" +
      '<section class="result-block"><h2>使用说明</h2>' +
      howHtml +
      "</section>" +
      '<section class="result-block"><h2>适用场景</h2>' +
      list(mod.scenarios, false) +
      "</section>" +
      '<section class="result-block"><h2>误用边界</h2>' +
      list(mod.boundaries, false) +
      "</section>" +
      '<section class="result-block"><h2>相关标签</h2><p class="tags">' +
      (mod.tags || [])
        .map(function (t) {
          return '<span class="pill soft">' + escapeHtml(t) + "</span>";
        })
        .join(" ") +
      "</p></section>" +
      '<p class="module-cta"><a class="btn btn-ghost" href="ask.html">带着这个透镜去智能识人</a></p>' +
      "</article>";
  }

  function initKbPage() {
    var listEl = qs("#kb-list");
    var search = qs("#kb-search");
    if (!listEl) return;

    function paint() {
      var filter = search ? search.value.trim() : "";
      var groups = { A: [], B: [], C: [] };
      (window.KB_MODULES || []).forEach(function (m) {
        var hay = (m.name + m.summary + (m.tags || []).join(" ") + (m.askHints || []).join(" ")).toLowerCase();
        if (filter && hay.indexOf(filter.toLowerCase()) === -1) return;
        (groups[m.tier] || groups.B).push(m);
      });
      var html = "";
      ["A", "B", "C"].forEach(function (tier) {
        var list = groups[tier];
        if (!list.length) return;
        html +=
          '<section class="kb-group" aria-labelledby="tier-' +
          tier +
          '"><h2 id="tier-' +
          tier +
          '" class="kb-group-title">' +
          (window.KB_CATEGORIES[tier] || tier) +
          '</h2><div class="card-grid">';
        list.forEach(function (m) {
          html +=
            '<a class="card card-link" href="module.html?id=' +
            encodeURIComponent(m.id) +
            '"><div class="card-meta"><span class="pill">' +
            tierLabel(m.tier) +
            '</span><span class="pill soft">' +
            escapeHtml(m.category || "") +
            "</span></div><h3>" +
            escapeHtml(m.name) +
            '</h3><p class="card-diagram-hint">含结构图</p><p>' +
            escapeHtml(m.summary) +
            "</p></a>";
        });
        html += "</div></section>";
      });
      if (!html) {
        html =
          '<div class="banner banner-empty" role="status">没有匹配的模块。试试其他关键词，或清空搜索。</div>';
      }
      listEl.innerHTML = html;
      listEl.setAttribute("aria-busy", "false");
    }

    listEl.setAttribute("aria-busy", "true");
    listEl.innerHTML = '<p class="muted loading-line" role="status">载入知识库…</p>';
    // microtask paint for loading state visibility
    setTimeout(paint, 40);
    if (search) {
      search.addEventListener("input", paint);
    }

    // hash shortcut: kb.html#six-layer → redirect to module
    var hash = (window.location.hash || "").replace(/^#/, "");
    if (hash && window.KB_BY_ID && window.KB_BY_ID[hash]) {
      window.location.replace("module.html?id=" + encodeURIComponent(hash));
    }
  }

  function initModulePage() {
    var el = qs("#module-root");
    if (!el) return;
    el.innerHTML = '<p class="muted loading-line" role="status">载入模块…</p>';
    var id = getQueryParam("id") || (window.location.hash || "").replace(/^#/, "");
    setTimeout(function () {
      renderModuleDetail(el, id);
    }, 40);
  }

  function initAskPage() {
    var form = qs("#ask-form");
    var out = qs("#ask-result");
    var btn = qs("#ask-submit");
    var person = qs("#person-input");
    var intent = qs("#intent-input");
    if (!form || !out) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      out.setAttribute("aria-busy", "true");
      out.innerHTML = '<p class="muted loading-line" role="status">正在以正见校准并合成透镜…</p>';
      if (btn) {
        btn.disabled = true;
        btn.textContent = "看见中…";
      }
      setTimeout(function () {
        var result = window.AskEngine.run(person.value, intent.value);
        out.innerHTML = result.html;
        out.setAttribute("aria-busy", "false");
        out.focus && out.focus();
        if (btn) {
          btn.disabled = false;
          btn.textContent = "开始看见";
        }
        try {
          out.scrollIntoView({ behavior: "smooth", block: "start" });
        } catch (err) {}
      }, 280);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setActiveNav();
    initKbPage();
    initModulePage();
    initAskPage();
  });

  window.ShirenApp = {
    escapeHtml: escapeHtml,
    getQueryParam: getQueryParam,
    toSteps: toSteps
  };
})();
