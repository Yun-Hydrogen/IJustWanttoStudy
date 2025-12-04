// ==UserScript==
// @name         [IJWS]I just want to study-我只是想学习
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  组卷网辅助功能，提供刷题模式来沉浸式刷题
// @author       GitHub Copilot
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

        /* 题目样式优化 */
        body.clean-mode .tk-quest-item {
            margin-bottom: 30px !important;
            padding-bottom: 20px !important;
            border-bottom: 1px dashed #ccc !important;
            background: #fff !important;
        }

        body.clean-mode .exam-item__cnt {
            font-size: 16px !important;
            line-height: 1.8 !important;
            margin-bottom: 15px !important;
            color: #000 !important;
        }

        body.clean-mode .exam-item__opt {
            background-color: #f5f7fa !important;
            padding: 15px !important;
            border-radius: 6px;
            margin-top: 10px;
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
            font-family: "SimSun", "宋体", serif !important;
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

    // 2. 定义 UI 样式
    const uiCss = `
        /* 悬浮球容器 */
        #ijws-container {
            position: fixed;
            top: 120px;
            left: 100px;
            z-index: 2147483647;
            width: 50px;
            height: 50px;
            user-select: none;
        }

        /* 主按钮 */
        #ijws-main-btn {
            width: 100%;
            height: 100%;
            background-color: #66CCFF;
            border-radius: 50%;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            cursor: grab;
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
            cursor: grabbing;
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
            cursor: pointer;
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
            transform: translateX(-60px) scale(1);
            opacity: 1;
        }
        #ijws-container.open .ijws-menu-item:nth-of-type(3) { /* 菜单2: 上方 */
            transform: translateY(-60px) scale(1);
            opacity: 1;
        }
        #ijws-container.open .ijws-menu-item:nth-of-type(4) { /* 菜单3: 右侧 */
            transform: translateX(60px) scale(1);
            opacity: 1;
        }

        /* 图标 */
        .ijws-menu-item svg {
            width: 18px;
            height: 18px;
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
        .ijws-menu-item:nth-of-type(2) .ijws-tooltip { /* 菜单1(左): 提示在上 */
            bottom: 40px;
            left: 50%;
            transform: translateX(-50%);
        }
        .ijws-menu-item:nth-of-type(3) .ijws-tooltip { /* 菜单2(上): 提示在上 */
            bottom: 40px;
            left: 50%;
            transform: translateX(-50%);
        }
        .ijws-menu-item:nth-of-type(4) .ijws-tooltip { /* 菜单3(右): 提示在上 */
            bottom: 40px;
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

    // 菜单3 (备用)
    const item3 = document.createElement('div');
    item3.className = 'ijws-menu-item';
    item3.innerHTML = `
        <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="200" height="200"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" fill="#A8A8A8"></path><path d="M512 440c-39.8 0-72 32.2-72 72s32.2 72 72 72 72-32.2 72-72-32.2-72-72-72zm-240 0c-39.8 0-72 32.2-72 72s32.2 72 72 72 72-32.2 72-72-32.2-72-72-72zm480 0c-39.8 0-72 32.2-72 72s32.2 72 72 72 72-32.2 72-72-32.2-72-72-72z" fill="#A8A8A8"></path></svg>
        <span class="ijws-tooltip">备用功能</span>
    `;

    container.appendChild(mainBtn);
    container.appendChild(item1);
    container.appendChild(item2);
    container.appendChild(item3);
    document.body.appendChild(container);

    // 提示弹窗
    const toast = document.createElement('div');
    toast.id = 'ijws-toast';
    // 初始内容为空，动态设置
    document.body.appendChild(toast);

    // 4. 逻辑实现
    let currentMode = null; // 'exam' | 'reference' | null
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;
    let toastTimer;

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

    // 拖拽功能
    mainBtn.addEventListener('mousedown', function(e) {
        isDragging = false;
        startX = e.clientX;
        startY = e.clientY;
        const rect = container.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;

        const onMouseMove = (e) => {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
                isDragging = true;
                container.style.left = (initialLeft + dx) + 'px';
                container.style.top = (initialTop + dy) + 'px';
                container.style.right = 'auto'; // 清除 right 属性以允许自由移动
            }
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
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
            
            // 收起答案
            const showAnswerBtn = document.querySelector('.tklabel-checkbox.show-answer.checkbox-default');
            if (showAnswerBtn && showAnswerBtn.classList.contains('checked')) {
                showAnswerBtn.click();
            }
            
            // 移除题号
            removeQuestionNumbers();

            showToast('已退出参考模式', iconSvg, '#f56c6c');
        } else {
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

    // 点击菜单3：备用
    item3.addEventListener('click', function() {
        const iconSvg = item3.querySelector('svg').outerHTML;
        showToast('功能开发中...', iconSvg, '#909399');
    });

})();