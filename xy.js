// ==UserScript==
// @name         cyan xy - 固定标签页标题
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  把 https://xy.aa.bb.cc:1111/ 的标签页标题固定为 "cyan xy"，禁止网页改回
// @match        https://xy.znas.ccwu.cc:1220/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // ===== 可修改的配置 =====
  const FIXED_TITLE = 'cyan xy'; // 想显示的固定标题
  const LOCK = true;             // true = 完全锁死，网页再也改不动；false = 只在页面自己改完后拉回来
  // =======================

  const apply = () => {
    if (document.title !== FIXED_TITLE) {
      document.title = FIXED_TITLE;
    }
  };

  // 第一层：立即写入
  apply();

  // 第二层：劫持 document.title 的读写，页面调用 setter 时被直接吞掉
  if (LOCK) {
    try {
      Object.defineProperty(Document.prototype, 'title', {
        configurable: true,
        get: () => FIXED_TITLE,
        set: () => {}
      });
    } catch (e) {
      // 极少数站点锁了原型，忽略即可，还有第三层兜底
    }
  }

  // 第三层：兜底，<title> 标签被整体替换时用 MutationObserver 拉回来
  const startObserver = () => {
    const target = document.documentElement || document.head || document.body || document;
    new MutationObserver(apply).observe(target, { childList: true, subtree: true });
  };

  if (document.documentElement) {
    startObserver();
  } else {
    document.addEventListener('readystatechange', startObserver, { once: true });
  }
})();
