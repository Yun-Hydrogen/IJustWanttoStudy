// ==UserScript==
// @name         [IJWS]I just want to study-我只是想学习
// @namespace    http://tampermonkey.net/
// @version      release-20251205
// @description  组卷网辅助功能，提供刷题模式来沉浸式刷题
// @author       云氢YunHydrogen
// @match        *://zujuan.xkw.com/*
// @icon         https://www.xkw.com/favicon.ico
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    // 1. 定义沉浸模式的 CSS 样式
    const cleanCss = `
        /* 隐藏全局干扰元素 */
        body.clean-mode .header,
        body.clean-mode .bread-nav,
        body.clean-mode .footer,
        body.clean-mode .fiexd-nav,
        body.clean-mode .ai-entry,
        body.clean-mode .other-info,
        body.clean-mode .xep-root,
        body.clean-mode iframe,
        body.clean-mode .care-mode_protect-eye,
        body.clean-mode .free-ad,
        body.clean-mode .low-browser,
        body.clean-mode .ques-additional,
        body.clean-mode .exam-item__custom,
        body.clean-mode .exam-item__info,
        body.clean-mode .sec-title .btn-box,
        body.clean-mode .ctrl-box
        {
            display: none !important;
        }

        /* 页面布局调整 */
        body.clean-mode {
            background-color: #ffffff !important;
            overflow-x: hidden;
        }

        body.clean-mode .page.exam-detail {
            width: 100% !important;
            max-width: 950px !important;
            margin: 0 auto !important;
            padding: 20px !important;
            background: #ffffff !important;
            float: none !important;
        }

        body.clean-mode .exam-cnt {
            width: 100% !important;
            float: none !important;
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
        }

        /* 全模式题目衬底收紧 */
        .tk-quest-item,
        .quesroot {
              margin: 0 !important;
              padding: 0 !important;
        }

        /* 统一 wrapper/quesdiv/selected-mask 上下间距 */
        .wrapper,
        .quesdiv,
        .selected-mask {
            margin-block: 0 !important;
            padding-block: 0 !important;
        }

        /* 题目样式优化 */
        body.clean-mode .tk-quest-item {
            margin-bottom: 16px !important;
            padding-top: 8px !important;
            padding-bottom: 12px !important;
            border-bottom: 1px dashed #ccc !important;
            background: #fff !important;
        }

        body.clean-mode .tk-quest-item:hover,
        body.clean-mode .quesroot:hover {
            border: none !important;
            border-bottom: 1px dashed #ccc !important;
            box-shadow: none !important;
            background: #fff !important;
        }

        body.clean-mode .exam-item__cnt {
            font-size: 16px !important;
            line-height: 1.8 !important;
            margin-top: 0 !important;
            margin-bottom: 0 !important;
            color: #000 !important;
            background: #ffffff !important;
            border: 0.5px solid #e0e7f1 !important;
            border-radius: 8px !important;
            padding: 0 16px !important;
            box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06) !important;
        }

        body.clean-mode .exam-item__opt {
            background-color: #f5f7fa !important;
            border: 1px solid #dde3ec !important;
            padding: 14px !important;
            border-radius: 8px !important;
            margin-top: 12px !important;
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.6), 0 6px 18px rgba(56, 103, 214, 0.08) !important;
        }

        #ijws-practice-answers .exam-item__opt {
            background-color: #f5f7fa !important;
            border: 1px solid #dde3ec !important;
            padding: 14px !important;
            border-radius: 8px !important;
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.6), 0 6px 18px rgba(56, 103, 214, 0.08) !important;
            margin-top: 6px !important;
        }

        /* 去除 selected-mask 导致的模糊和遮罩 */
        body.clean-mode .selected-mask {
            filter: none !important;
            -webkit-filter: none !important;
            opacity: 1 !important;
            background: none !important;
            transform: none !important;
            position: static !important;
        }

        body.clean-mode .selected-mask::before,
        body.clean-mode .selected-mask::after {
            display: none !important;
            content: none !important;
            width: 0 !important;
            height: 0 !important;
        }

        /* 标题样式优化 */
        body.clean-mode .title-txt {
            font-weight: bold !important;
            font-family: "SimHei", "黑体", "Microsoft YaHei", sans-serif !important;
            font-size: 22px !important;
            letter-spacing: 0.5px !important;
            background: #f1f3f5 !important;
            display: inline-block !important;
            padding: 6px 14px !important;
            border-radius: 6px !important;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08) !important;
        }

        /* 练习模式答案区 */
        .ijws-practice-hidden {
            display: none !important;
        }

        #ijws-practice-answers {
            margin-top: 40px;
            padding: 18px;
            border: 1px dashed #39C5BB;
            border-radius: 8px;
            background: #fdfefe;
        }

        #ijws-practice-answers .ijws-practice-heading {
            font-weight: bold;
            margin-bottom: 16px;
            color: #39C5BB;
            font-size: 18px;
        }

        .ijws-practice-answer {
            margin-bottom: 14px;
            padding-bottom: 12px;
            border-bottom: 1px solid #eee;
        }

        .ijws-practice-title {
            font-weight: bold;
            margin-bottom: 8px;
            color: #333;
        }

        /* 打印优化 */
        @media print {
            #ijws-container { display: none !important; }
            body.clean-mode .page.exam-detail { max-width: 100% !important; padding: 0 !important; }
            body.clean-mode .exam-item__opt { background-color: transparent !important; border: 1px solid #eee; }
            body.clean-mode .tk-quest-item { page-break-inside: avoid; }
        }

        /* 提示弹窗 */
        #ijws-toast {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            font-size: 14px;
            z-index: 2147483647;
            display: flex;
            align-items: center;
            gap: 8px;
            opacity: 0;
            transition: opacity 0.3s;
            pointer-events: none;
        }
        #ijws-toast.show {
            opacity: 1;
        }
        #ijws-toast svg {
            width: 20px;
            height: 20px;
        }
        
        /* 子菜单激活状态 */
        .ijws-menu-item.active {
            background-color: #00FFCC !important;
        }
    `;

    // 自定义指针 SVG（用作光标）
    const cursorSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><defs><filter id="cursorShadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="4" dy="4" stdDeviation="6" flood-color="#999999" flood-opacity="0.6"/></filter></defs><g transform="translate(512 512) rotate(-30) scale(0.5) translate(-512 -512)"><path filter="url(#cursorShadow)" fill="#d3d3d3" d="M179.2 920.96c-16 0-32.64-6.4-44.8-18.56-18.56-18.56-23.68-46.72-13.44-71.04L442.88 99.2c10.24-23.04 33.28-38.4 58.88-38.4s48.64 15.36 58.88 38.4l321.92 732.16c10.88 24.96 5.12 52.48-13.44 71.04-18.56 18.56-46.08 23.68-70.4 13.44l-296.96-117.76-298.24 118.4c-8.32 3.2-16 4.48-24.32 4.48zm-10.88-94.08c-0.64 0-1.28 0.64-1.92 0.64l1.92-0.64zm665.6-0.64l1.28 0.64c-0.64 0-1.28 0-1.28-0.64zm-332.8-622.08l-261.12 593.92 243.2-96.64c11.52-4.48 24.32-4.48 35.84 0l243.2 96.64-261.12-593.92z"/></g></svg>`;
    const cursorDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(cursorSvg)}`;
    const PRACTICE_CONTAINER_ID = 'ijws-practice-answers';
    const GITHUB_URL = 'https://github.com/Yun-Hydrogen/IJustWanttoStudy';

    // 2. 定义 UI 样式
    const uiCss = `
        /* 悬浮球容器 */
        #ijws-container {
            position: fixed;
            bottom: 120px;
            right: 120px;
            z-index: 2147483647;
            width: 50px;
            height: 50px;
            user-select: none;
            cursor: url('${cursorDataUrl}') 6 6, auto;
        }

        /* 主按钮 */
        #ijws-main-btn {
            width: 100%;
            height: 100%;
            background-color: #66CCFF;
            border-radius: 50%;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            cursor: url('${cursorDataUrl}') 6 6, grab;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 12px;
            position: absolute;
            top: 0;
            left: 0;
            z-index: 10;
            transition: background-color 0.3s, transform 0.2s;
        }
        #ijws-main-btn:active {
            cursor: url('${cursorDataUrl}') 6 6, grabbing;
            transform: scale(0.95);
        }
        #ijws-main-btn svg {
            width: 20px;
            height: 20px;
            margin-top: 2px;
            fill: white;
        }

        /* 菜单项 */
        .ijws-menu-item {
            width: 32px;
            height: 32px;
            background-color: #fff;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            position: absolute;
            top: 9px; /* (50-32)/2 */
            left: 9px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: url('${cursorDataUrl}') 6 6, pointer;
            opacity: 0;
            transform: translate(0, 0) scale(0);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            z-index: 5;
            pointer-events: none;
        }

        /* 菜单展开位置 */
        #ijws-container.open .ijws-menu-item {
            pointer-events: auto;
        }
        #ijws-container.open .ijws-menu-item:nth-of-type(2) { /* 菜单1: 左侧 */
            transform: translateX(-45px) scale(1);
            opacity: 1;
        }
        #ijws-container.open .ijws-menu-item:nth-of-type(3) { /* 菜单2: 上方 */
            transform: translateY(-45px) scale(1);
            opacity: 1;
        }
        #ijws-container.open .ijws-menu-item:nth-of-type(4) { /* 菜单3: 右侧 */
            transform: translateX(45px) scale(1);
            opacity: 1;
        }
        #ijws-container.open .ijws-menu-item:nth-of-type(5) { /* 菜单4: 下方 */
            transform: translateY(45px) scale(1);
            opacity: 1;
        }

        /* 图标 */
        .ijws-menu-item svg {
            width: 18px;
            height: 18px;
        }

        .ijws-menu-item svg,
        .ijws-menu-item svg path {
            fill: #000000 !important;
        }

        /* Tooltip */
        .ijws-tooltip {
            position: absolute;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            white-space: nowrap;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s;
            visibility: hidden;
        }
        
        /* Tooltip 位置 */
        .ijws-menu-item:nth-of-type(2) .ijws-tooltip { /* 菜单1(左): 提示在左 */
            right: 40px;
            top: 50%;
            transform: translateY(-50%);
        }
        .ijws-menu-item:nth-of-type(3) .ijws-tooltip { /* 菜单2(上): 提示在上 */
            bottom: 40px;
            left: 50%;
            transform: translateX(-50%);
        }
        .ijws-menu-item:nth-of-type(4) .ijws-tooltip { /* 菜单3(右): 提示在右 */
            left: 40px;
            top: 50%;
            transform: translateY(-50%);
        }
        .ijws-menu-item:nth-of-type(5) .ijws-tooltip { /* 菜单4(下): 提示在下 */
            top: 40px;
            left: 50%;
            transform: translateX(-50%);
        }

        .ijws-menu-item:hover .ijws-tooltip {
            opacity: 1;
            visibility: visible;
        }
    `;

    // 注入样式
    const styleEl = document.createElement('style');
    styleEl.id = 'clean-mode-style';
    styleEl.textContent = cleanCss + uiCss;
    document.head.appendChild(styleEl);

    // 3. 创建 UI 结构
    const container = document.createElement('div');
    container.id = 'ijws-container';

    // 主按钮
    const mainBtn = document.createElement('div');
    mainBtn.id = 'ijws-main-btn';
    mainBtn.innerHTML = `
        <span>IJWS</span>
        <svg t="1764828523341" class="icon" viewBox="0 0 1025 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="11072" width="200" height="200"><path d="M1025.1 568c0-24.2-13.7-46.4-35.4-57.2l-202.3-101c-10.8-5.4-17.7-16.5-17.7-28.6V172.7c0-26.7-16.6-50.6-41.6-59.9L550.5 46.3c-24.2-9-50.8-9-74.9 0.1l-176.9 66.8c-24.9 9.4-41.4 33.3-41.4 59.9v207.1c0 12.1-6.9 23.2-17.7 28.6L35.5 510.7C13.8 521.5 0 543.8 0.1 568.1l0.5 226c0 23.2 12.6 44.5 32.9 55.8l223.8 124.6 1.2 0.7c18.9 10.5 41.9 10.4 60.8-0.2l2-1.1L497 873.2c9.9-5.7 22.1-5.7 32 0.1l176.8 102.5c9.5 5.4 20.1 8.1 30.7 8.1 10.4 0 20.9-2.6 30.3-7.8l3-1.7L992.4 851c20.4-11.3 33-32.8 33-56.1l-0.3-226.9zM705.6 379.8c0 12.2-6.8 23.3-17.7 28.7l-131.4 65.7c-5.3 2.7-11.6-1.2-11.6-7.2V304.1c0-29.1 17.7-55.2 44.7-66L705 192l0.6 187.8zM257.5 621l-0.2-0.1-149.1-75 149.1-74.4 16.8-8.4c9.2-4.6 20-4.5 29.1 0.3l18.1 9.4 129.8 64.3c5.8 2.9 6 11.1 0.2 14.2l-130 69.8c-20 10.1-43.7 10-63.8-0.1z m205.7 203.9l-141.8 70.6-0.8-163.6c-0.1-27 15.1-51.8 39.2-63.9l108.8-54.5c5.3-2.7 11.6 1.2 11.6 7.1l0.8 175.6c0 12.1-6.9 23.2-17.8 28.7zM488 182.6L385 144l128-48 128 48-103 38.6c-16.1 6.1-33.9 6.1-50 0z m215.7 439.2l-129.2-70.5c-5.7-3.1-5.5-11.3 0.3-14.2l131-65.3 16.1-8.4c9.1-4.8 20-4.9 29.1-0.3l18.7 9.3L916.9 546l-146.2 76.5c-21.1 10.9-46.2 10.7-67-0.7zM961 780.7c0 11.8-6.5 22.7-17 28.3l-174.3 92.2-0.6-169.1c-0.1-27 15.1-51.8 39.3-63.8L961 592v188.7z" p-id="11073"></path></svg>
    `;

    // 菜单1 (试卷模式)
    const item1 = document.createElement('div');
    item1.className = 'ijws-menu-item';
    item1.innerHTML = `
        <svg t="1764838109817" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="15457" width="200" height="200"><path d="M433.8 387.6H632.6c16.6-3.7 28.7-17.1 28.7-32 0-19.7-12.3-32-32-32H430.5c-16.6 3.7-28.7 17.1-28.7 32 0 19.7 12.3 32 32 32z" fill="#A8A8A8" p-id="15458"></path><path d="M817.7 675.6V230.7c-3.8-58.5-51.2-102.6-110.2-102.6H230.6C172.1 131.9 128 179.3 128 238.3c0 30.3 11.2 58.1 31.6 78.6 20.4 20.4 48.3 31.6 78.6 31.6h7.1v444.9c3.8 58.5 51.2 102.6 110.2 102.6h441.7c55.3-3.8 98.7-52.2 98.7-110.2V675.6h-78.2zM192 238.2c0-27.2 19-46.2 46.2-46.2h7.1v92.5h-11.7l-0.7-0.1c-23.7-4.8-40.9-24.2-40.9-46.2z m117.3 547.6V192h402.8l0.7 0.1c23.7 4.7 40.9 24.1 40.9 46.1v437.3h-352v114.8l-0.1 0.7c-4.6 22.9-23.1 40.9-42.2 40.9H351l-0.7-0.1c-23.8-4.7-41-24.1-41-46z m149 36.8c3.8-11.5 7.5-22.4 7.5-36.9v-46.2H832v50.9l-0.1 0.7c-4.6 22.9-23.1 40.9-42.2 40.9H455.2l3.1-9.4z" fill="#A8A8A8" p-id="15459"></path><path d="M433.8 544H632.6c16.6-3.7 28.7-17.1 28.7-32 0-19.7-12.3-32-32-32H430.5c-16.6 3.7-28.7 17.1-28.7 32 0 19.7 12.3 32 32 32z" fill="#A8A8A8" p-id="15460"></path></svg>
        <span class="ijws-tooltip">试卷模式</span>
    `;

    // 菜单2 (参考模式)
    const item2 = document.createElement('div');
    item2.className = 'ijws-menu-item';
    item2.innerHTML = `
        <svg t="1764836133590" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="13657" width="200" height="200"><path d="M662.016 186.368c9.728 4.608 16.384 13.824 17.408 24.576 1.024 10.752-4.096 20.992-12.8 27.136-8.704 6.144-19.968 7.168-30.208 2.56-39.936-18.432-82.944-28.16-126.464-27.648-166.4 0-301.056 134.656-301.056 301.056s134.656 301.056 301.056 301.056 301.056-134.656 301.056-301.056c0-76.288-28.672-149.504-80.384-204.8-10.752-12.288-10.24-30.72 2.048-41.984 11.776-11.264 30.72-10.752 41.984 1.024 62.464 66.56 96.768 154.624 96.768 246.272 0 199.68-161.792 361.472-361.472 361.472S148.48 714.24 148.48 514.56s161.792-361.472 361.472-361.472c53.248 0 104.448 11.776 152.064 33.28z" p-id="13658"></path><path d="M573.44 597.504H443.904l-15.36 40.96c-6.144 15.872-10.752 26.624-15.36 32.256-4.096 5.632-11.264 8.192-20.48 8.192-8.192 0-15.36-3.072-21.504-8.704-6.144-6.144-9.216-12.8-9.216-19.968 0-4.096 0.512-8.704 2.048-13.312 1.536-4.608 3.584-11.264 7.168-19.456l81.408-206.848c2.56-6.144 5.12-13.312 8.192-21.504 3.072-8.192 6.656-15.36 10.24-20.992 3.584-5.632 8.704-9.728 14.336-13.312s13.312-5.12 22.016-5.12c9.216 0 16.384 1.536 22.528 5.12 6.144 3.584 10.752 7.68 14.336 13.312 3.584 5.12 6.656 11.264 9.216 17.408 2.56 6.144 5.632 14.336 9.728 24.576l82.944 205.312c6.656 15.872 9.728 27.136 9.728 34.304 0 7.168-3.072 14.336-9.216 20.48s-13.824 9.216-22.016 9.216c-5.12 0-9.216-1.024-12.8-2.56-3.584-2.048-6.656-4.096-9.216-7.168-2.56-3.072-5.12-7.68-7.68-14.336-3.072-6.656-5.12-12.288-7.168-16.896l-14.336-40.96z m-112.64-48.128h95.232l-48.128-131.584-47.104 131.584z" p-id="13659"></path></svg>
        <span class="ijws-tooltip">参考模式</span>
    `;

    // 菜单3 (练习模式)
    const item3 = document.createElement('div');
    item3.className = 'ijws-menu-item';
    item3.innerHTML = `
        <svg t="1764853498269" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="11038" width="200" height="200"><path d="M896 604a36 36 0 0 0-36 36v128c0 50.72-41.28 92-92 92H256c-50.72 0-92-41.28-92-92V256c0-50.72 41.28-92 92-92h128a36 36 0 0 0 0-72H256c-90.44 0-164 73.56-164 164v512c0 90.44 73.56 164 164 164h512c90.44 0 164-73.56 164-164v-128a36 36 0 0 0-36-36z" p-id="11039"></path><path d="M316 544v128a36 36 0 0 0 36 36h128c9.56 0 18.72-3.8 25.44-10.56l320-320c23.88-23.88 37.04-55.68 37.04-89.44s-13.16-65.56-37.04-89.44c-49.32-49.32-129.6-49.32-178.92 0l-320 320a36.004 36.004 0 0 0-10.56 25.44z m72 14.92l309.44-309.44c21.24-21.24 55.84-21.24 77.08 0 10.28 10.28 15.96 24 15.96 38.56s-5.68 28.24-15.96 38.56l-309.44 309.44H388v-77.08z" p-id="11040"></path></svg>
        <span class="ijws-tooltip">练习模式</span>
    `;

    // 菜单4 (备用功能)
    const item4 = document.createElement('div');
    item4.className = 'ijws-menu-item';
    item4.innerHTML = `
        <svg t="1764900000000" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="20000" width="200" height="200"><path d="M512 64c-247.424 0-448 200.576-448 448s200.576 448 448 448 448-200.576 448-448S759.424 64 512 64zm0 64c212.064 0 384 171.936 384 384S724.064 896 512 896 128 724.064 128 512 299.936 128 512 128zm32 160h-64v160H320v64h160v160h64V512h160v-64H544V288z" p-id="20001"></path></svg>
        <span class="ijws-tooltip">备用功能</span>
    `;

    container.appendChild(mainBtn);
    container.appendChild(item1);
    container.appendChild(item2);
    container.appendChild(item3);
    container.appendChild(item4);
    document.body.appendChild(container);

    // 提示弹窗
    const toast = document.createElement('div');
    toast.id = 'ijws-toast';
    // 初始内容为空，动态设置
    document.body.appendChild(toast);

    // 4. 逻辑实现
    let currentMode = null; // 'exam' | 'reference' | 'practice' | null
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;
    let toastTimer;
    let longPressTimer;

    const questionClickBlocker = (event) => {
        if (!currentMode) return;
        const target = event.target.closest('.tk-quest-item, .quesroot');
        if (target) {
            event.stopPropagation();
            event.preventDefault();
        }
    };
    document.addEventListener('click', questionClickBlocker, true);

    // 显示提示
    function showToast(message, iconSvg, iconColor) {
        // 移除原有的 fill 属性，确保颜色生效
        let processedSvg = iconSvg.replace(/fill="[^"]*"/g, '');
        // 注入新的颜色样式
        processedSvg = processedSvg.replace('<svg', `<svg style="fill: ${iconColor};"`);

        toast.innerHTML = `
            ${processedSvg}
            <span>${message}</span>
        `;
        toast.classList.add('show');
        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // 切换纯净模式视觉效果
    function toggleCleanVisuals(enable) {
        if (enable) {
            document.body.classList.add('clean-mode');
            mainBtn.style.backgroundColor = '#39C5BB'; // 启用色
            // 尝试移除行内样式
            document.querySelectorAll('.selected-mask').forEach(el => {
                el.style.filter = 'none';
                el.style.opacity = '1';
            });
        } else {
            document.body.classList.remove('clean-mode');
            mainBtn.style.backgroundColor = '#66CCFF'; // 默认色
            // 恢复行内样式
            document.querySelectorAll('.selected-mask').forEach(el => {
                el.style.filter = '';
                el.style.opacity = '';
            });
        }
    }

    // 添加题号到答案区域
    function addQuestionNumbers() {
        const items = document.querySelectorAll('.tk-quest-item');
        items.forEach((item, index) => {
            // 优先查找 .exam-item__opt，如果没有则尝试 .exam-item__analyze
            const answerBlock = item.querySelector('.exam-item__opt') || item.querySelector('.exam-item__analyze');
            if (answerBlock) {
                if (!answerBlock.querySelector('.ijws-q-num')) {
                    const num = document.createElement('div');
                    num.className = 'ijws-q-num';
                    num.innerHTML = `<strong>第 ${index + 1} 题</strong>`;
                    num.style.color = '#FF6699';
                    num.style.marginBottom = '5px';
                    num.style.fontSize = '14px';
                    answerBlock.insertBefore(num, answerBlock.firstChild);
                }
            }
        });
    }

    // 移除题号
    function removeQuestionNumbers() {
        document.querySelectorAll('.ijws-q-num').forEach(el => el.remove());
    }

    function ensureAnswersVisible() {
        const showAnswerBtn = document.querySelector('.tklabel-checkbox.show-answer.checkbox-default');
        if (showAnswerBtn && !showAnswerBtn.classList.contains('checked')) {
            showAnswerBtn.click();
        }
    }

    function clearPracticeArtifacts() {
        document.querySelectorAll('.ijws-practice-hidden').forEach(el => el.classList.remove('ijws-practice-hidden'));
        const appendix = document.getElementById(PRACTICE_CONTAINER_ID);
        if (appendix) {
            appendix.remove();
        }
    }

    function moveAnswersToAppendix() {
        const host = document.querySelector('.page.exam-detail') || document.querySelector('.exam-cnt') || document.body;
        if (!host) return;

        let appendix = document.getElementById(PRACTICE_CONTAINER_ID);
        if (!appendix) {
            appendix = document.createElement('div');
            appendix.id = PRACTICE_CONTAINER_ID;
            host.appendChild(appendix);
        }

        appendix.innerHTML = '<div class="ijws-practice-heading">答案</div>';

        const questions = document.querySelectorAll('.tk-quest-item');
        questions.forEach((item, index) => {
            const answerBlock = item.querySelector('.exam-item__opt') || item.querySelector('.exam-item__analyze');
            if (!answerBlock) return;

            const clone = answerBlock.cloneNode(true);
            answerBlock.classList.add('ijws-practice-hidden');

            const wrapper = document.createElement('div');
            wrapper.className = 'ijws-practice-answer';
            wrapper.innerHTML = `<div class="ijws-practice-title">第 ${index + 1} 题</div>`;
            wrapper.appendChild(clone);
            appendix.appendChild(wrapper);
        });
    }

    // 统一处理参考模式产生的附加元素
    function resetReferenceArtifacts() {
        const showAnswerBtn = document.querySelector('.tklabel-checkbox.show-answer.checkbox-default');
        if (showAnswerBtn && showAnswerBtn.classList.contains('checked')) {
            showAnswerBtn.click();
        }
        removeQuestionNumbers();
    }

    // 拖拽功能
    function openGithubHome() {
        window.open(GITHUB_URL, '_blank');
    }

    mainBtn.addEventListener('mousedown', function(e) {
        isDragging = false;
        startX = e.clientX;
        startY = e.clientY;
        const rect = container.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;

        longPressTimer = setTimeout(() => {
            if (!isDragging) {
                openGithubHome();
            }
        }, 800);

        const onMouseMove = (e) => {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
                isDragging = true;
                clearTimeout(longPressTimer);
                container.style.left = (initialLeft + dx) + 'px';
                container.style.top = (initialTop + dy) + 'px';
                container.style.right = 'auto'; // 清除 right 属性以允许自由移动
            }
        };

        const onMouseUp = () => {
            clearTimeout(longPressTimer);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    ['mouseup', 'mouseleave'].forEach(evt => {
        mainBtn.addEventListener(evt, () => {
            clearTimeout(longPressTimer);
        });
    });

    mainBtn.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        openGithubHome();
    });

    // 点击主按钮：展开/收起菜单
    mainBtn.addEventListener('click', function(e) {
        if (!isDragging) {
            container.classList.toggle('open');
        }
    });

    // 点击菜单1：试卷模式
    item1.addEventListener('click', function() {
        const iconSvg = item1.querySelector('svg').outerHTML;
        
        if (currentMode === 'exam') {
            // 退出试卷模式
            currentMode = null;
            toggleCleanVisuals(false);
            item1.classList.remove('active');
            showToast('已退出试卷模式', iconSvg, '#f56c6c');
        } else {
            if (currentMode === 'reference') {
                resetReferenceArtifacts();
                item2.classList.remove('active');
            } else if (currentMode === 'practice') {
                clearPracticeArtifacts();
                resetReferenceArtifacts();
                item3.classList.remove('active');
            }
            // 进入试卷模式
            currentMode = 'exam';
            toggleCleanVisuals(true);
            item1.classList.add('active');
            item2.classList.remove('active');
            showToast('已进入试卷模式', iconSvg, '#67c23a');
        }
    });

    // 点击菜单2：参考模式
    item2.addEventListener('click', function() {
        const iconSvg = item2.querySelector('svg').outerHTML;

        if (currentMode === 'reference') {
            // 退出参考模式
            currentMode = null;
            toggleCleanVisuals(false);
            item2.classList.remove('active');

            resetReferenceArtifacts();

            showToast('已退出参考模式', iconSvg, '#f56c6c');
        } else {
            if (currentMode === 'practice') {
                clearPracticeArtifacts();
                item3.classList.remove('active');
            }
            // 进入参考模式
            currentMode = 'reference';
            toggleCleanVisuals(true);
            item2.classList.add('active');
            item1.classList.remove('active');
            
            // 展开答案
            const showAnswerBtn = document.querySelector('.tklabel-checkbox.show-answer.checkbox-default');
            if (showAnswerBtn && !showAnswerBtn.classList.contains('checked')) {
                showAnswerBtn.click();
            }
            
            // 添加题号 (延迟一点执行以确保答案区域已渲染)
            setTimeout(addQuestionNumbers, 1000);
            
            showToast('已进入参考模式', iconSvg, '#67c23a');
        }
    });

    // 点击菜单3：练习模式
    item3.addEventListener('click', function() {
        const iconSvg = item3.querySelector('svg').outerHTML;

        if (currentMode === 'practice') {
            currentMode = null;
            toggleCleanVisuals(false);
            item3.classList.remove('active');
            clearPracticeArtifacts();
            resetReferenceArtifacts();
            showToast('已退出练习模式', iconSvg, '#f56c6c');
            return;
        }

        if (currentMode === 'exam') {
            item1.classList.remove('active');
            resetReferenceArtifacts();
        } else if (currentMode === 'reference') {
            item2.classList.remove('active');
        }

        clearPracticeArtifacts();
        currentMode = 'practice';
        toggleCleanVisuals(true);
        item3.classList.add('active');
        item1.classList.remove('active');
        item2.classList.remove('active');

        ensureAnswersVisible();

        setTimeout(() => {
            if (currentMode !== 'practice') return;
            addQuestionNumbers();
            moveAnswersToAppendix();
        }, 800);

        showToast('已进入练习模式', iconSvg, '#67c23a');
    });

    // 菜单4：备用功能提示
    item4.addEventListener('click', function() {
        const iconSvg = item4.querySelector('svg').outerHTML;
        showToast('备用功能开发中，敬请期待', iconSvg, '#409EFF');
    });

})();