/* ============================================================
   main.js - 网站交互逻辑
   功能：移动端菜单 / 滚动高亮导航 / 滚动淡入动画 /
        PDF 简历下载 / 图片占位符兜底
   ============================================================ */

(function () {
    'use strict';

    /* ------------------------------------------------------------
       1. 移动端汉堡菜单：点击展开/收起，点击链接后自动收起
       ------------------------------------------------------------ */
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', function () {
            mobileMenu.classList.toggle('hidden');
        });
        // 点击移动端任意链接后收起菜单
        document.querySelectorAll('.mobile-link').forEach(function (link) {
            link.addEventListener('click', function () {
                mobileMenu.classList.add('hidden');
            });
        });
    }

    /* ------------------------------------------------------------
       2. 导航栏滚动效果 + 当前区块高亮
       ------------------------------------------------------------ */
    const navbar = document.getElementById('navbar');
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link, .mobile-link');

    // 滚动时给导航栏加阴影
    window.addEventListener('scroll', function () {
        if (window.scrollY > 20) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        highlightNav();
    });

    // 根据 scroll 位置高亮对应导航项
    function highlightNav() {
        let current = '';
        const scrollPos = window.scrollY + 120; // 偏移补偿
        sections.forEach(function (section) {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            if (scrollPos >= top && scrollPos < top + height) {
                current = section.getAttribute('id');
            }
        });
        navLinks.forEach(function (link) {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    }
    highlightNav();

    /* ------------------------------------------------------------
       3. 滚动淡入动画：使用 IntersectionObserver 给元素加 visible
       使用：给任意元素加 class="fade-in" 即可在进入视口时淡入
       ------------------------------------------------------------ */
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -80px 0px'
    };
    const fadeInObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                fadeInObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(function (el) {
        fadeInObserver.observe(el);
    });

    /* ------------------------------------------------------------
       4. PDF 简历下载功能（部署在线上后他人即可正常下载）
       使用说明：把简历 PDF 放到项目根目录，命名为 resume.pdf
       逻辑：
         · 部署在 http(s):// 下：fetch HEAD 检测文件是否存在
           - 存在则触发下载；不存在则提示
         · fetch 失败时（如本地 file:// 协议、或服务器不支持 HEAD）：
           直接触发下载，由浏览器原生处理，保证最大兼容性
       ------------------------------------------------------------ */
    const downloadBtn = document.getElementById('download-resume');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function () {
            const resumeUrl = 'resume.pdf'; // 简历文件路径（根目录）

            fetch(resumeUrl, { method: 'HEAD' })
                .then(function (response) {
                    if (response.ok) {
                        triggerDownload(resumeUrl);
                    } else {
                        showResumeTip('未找到简历文件，请确认 resume.pdf 已放到项目根目录。');
                    }
                })
                .catch(function () {
                    // 本地 file:// 协议下 fetch 会失败；部署后若服务器拒绝 HEAD 也会走到这里
                    // 直接尝试触发下载，浏览器会处理：文件存在则下载，不存在则显示错误页
                    triggerDownload(resumeUrl);
                });
        });
    }

    // 触发文件下载：创建临时 a 标签并点击
    function triggerDownload(url) {
        const link = document.createElement('a');
        link.href = url;
        link.download = 'resume.pdf'; // 下载后的文件名，可自定义
        link.rel = 'noopener';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // 友好的提示弹层（替代 alert，样式更贴合主题）
    function showResumeTip(message) {
        // 避免重复弹层
        const existed = document.getElementById('resume-tip-overlay');
        if (existed) existed.remove();

        const overlay = document.createElement('div');
        overlay.id = 'resume-tip-overlay';
        overlay.style.cssText = [
            'position:fixed', 'inset:0', 'z-index:100',
            'display:flex', 'align-items:center', 'justify-content:center',
            'background:rgba(90,107,64,0.5)', 'backdrop-filter:blur(4px)'
        ].join(';');

        const box = document.createElement('div');
        box.style.cssText = [
            'max-width:90%', 'width:400px',
            'background:#F7F5F0', 'border-radius:1rem',
            'padding:1.5rem', 'text-align:center',
            'border:1px solid #6B7B4F',
            'box-shadow:0 10px 40px rgba(0,0,0,0.15)',
            'font-family:inherit'
        ].join(';');

        box.innerHTML =
            '<div style="font-size:2rem;margin-bottom:0.5rem;">📄</div>' +
            '<h3 style="color:#5A4E3C;font-size:1.125rem;font-weight:600;margin-bottom:0.5rem;">提示</h3>' +
            '<p style="color:#8B7D6B;font-size:0.875rem;line-height:1.6;margin-bottom:1.25rem;">' + message + '</p>' +
            '<button id="resume-tip-close" style="' +
            'background:#6B7B4F;color:#fff;border:none;border-radius:9999px;' +
            'padding:0.5rem 1.5rem;font-size:0.875rem;cursor:pointer;">知道了</button>';

        overlay.appendChild(box);
        document.body.appendChild(overlay);

        box.querySelector('#resume-tip-close').addEventListener('click', function () {
            overlay.remove();
        });
        // 点击遮罩关闭
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) overlay.remove();
        });
    }

    /* ------------------------------------------------------------
       5. 图片占位符兜底：图片加载失败时显示带图标的渐变占位
       使用：<img class="placeholder-img" src="images/xxx.jpg">
       图片缺失时会自动显示薄荷曼波渐变背景，不会出现破图
       ------------------------------------------------------------ */
    document.querySelectorAll('.placeholder-img').forEach(function (img) {
        img.addEventListener('error', function () {
            // 标记为兜底状态，CSS 会显示占位样式
            img.setAttribute('data-fallback', 'true');
            // 清空 src，露出 CSS 渐变背景
            img.removeAttribute('src');
            // 为头像圆形适配
            if (img.alt && img.alt.indexOf('头像') !== -1) {
                img.style.background = 'linear-gradient(135deg, #6B7B4F 0%, #F5B8BC 100%)';
                img.style.display = 'flex';
                img.style.alignItems = 'center';
                img.style.justifyContent = 'center';
            }
        });
    });

})();
