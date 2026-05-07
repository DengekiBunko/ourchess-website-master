/**
 * i18n script for static pages (about, privacy, contact)
 */
document.addEventListener('DOMContentLoaded', function() {
    let currentLanguage = 'en';

    const translations = {
        languageLabel: { zh: '语言：', en: 'Language:' },
        navHome: { zh: '首页', en: 'Home' },
        navAbout: { zh: '关于我们', en: 'About Us' },
        navPrivacy: { zh: '隐私政策', en: 'Privacy Policy' },
        navContact: { zh: '联系我们', en: 'Contact Us' },
        aboutTitle: { zh: '关于我们', en: 'About Us' },
        aboutWelcome: { zh: '欢迎来到我们的国际象棋网站', en: 'Welcome to Our Chess Website' },
        aboutDesc: { zh: '我们的国际象棋网站致力于为各级别的国际象棋爱好者提供一个有趣且富有教育意义的平台。无论您是学习基础知识的初学者，还是磨练技艺的经验丰富的棋手，我们都提供工具和资源来增强您的国际象棋之旅。', en: 'Our chess website is dedicated to providing an engaging and educational platform for chess enthusiasts of all levels. Whether you are a beginner learning the basics or an experienced player honing your skills, we offer tools and resources to enhance your chess journey.' },
        aboutMission: { zh: '我们的使命', en: 'Our Mission' },
        aboutMissionText: { zh: '让每个人都能接触、有趣且教育性地学习国际象棋。我们相信国际象棋不仅仅是一种游戏，更是一种培养批判性思维、策略和耐心的方式。', en: 'To make chess accessible, fun, and educational for everyone. We believe that chess is not just a game, but a way to develop critical thinking, strategy, and patience.' },
        aboutFeatures: { zh: '功能特色', en: 'Features' },
        aboutFeature1: { zh: '本地双人对战模式：在同一设备上与朋友对战。', en: 'Local Two-Player Mode: Play against a friend on the same device.' },
        aboutFeature2: { zh: 'AI对手：挑战可调节难度级别的AI。', en: 'AI Opponent: Challenge yourself against an AI with adjustable difficulty levels.' },
        aboutFeature3: { zh: '互动教程：学习规则、棋子移动和基本策略。', en: 'Interactive Tutorials: Learn the rules, piece movements, and basic strategies.' },
        aboutFeature4: { zh: '策略文章：阅读关于国际象棋战术和开局的深度文章。', en: 'Strategy Articles: Read in-depth articles on chess tactics and openings.' },
        aboutFeature5: { zh: '经典对局回放：研究著名对局并向大师学习。', en: 'Classic Games Replay: Study famous games and learn from masters.' },
        aboutTeam: { zh: '我们的团队', en: 'Our Team' },
        aboutTeamText: { zh: '我们是一支由国际象棋爱好者和开发者组成的热情团队，致力于创造最佳的在线国际象棋体验。我们的项目是开源的，可在GitHub上获取。', en: 'We are a passionate team of chess lovers and developers committed to creating the best chess experience online. Our project is open-source and available on GitHub.' },
        privacyTitle: { zh: '隐私政策', en: 'Privacy Policy' },
        privacyEffective: { zh: '生效日期：2026年5月8日', en: 'Effective Date: May 8, 2026' },
        privacyDesc: { zh: '本隐私政策描述了我们如何收集、使用和保护您在使用我们的国际象棋网站时的信息，包括我们使用的广告服务和Cookie技术。', en: 'This Privacy Policy describes how we collect, use, and protect your information when you use our chess website, including our use of advertising services and cookie technology.' },
        privacyCollect: { zh: '我们收集的信息', en: 'Information We Collect' },
        privacyCollectText: { zh: '我们的网站游戏功能设计为在您的浏览器中本地运行，不收集或存储游戏相关的个人信息。所有游戏数据、设置和交互都保留在您的设备上。', en: 'Our website game features are designed to run locally in your browser and do not collect or store game-related personal information. All game data, settings, and interactions remain on your device.' },
        privacyCookies: { zh: 'Cookie和广告', en: 'Cookies and Advertising' },
        privacyCookiesText: { zh: '我们使用第三方广告服务（如Google AdSense）在网站上展示广告。这些广告服务可能会使用Cookie和网络信标来收集有关您访问本网站及其他网站的信息，以便提供与您兴趣相关的广告。收集的信息可能包括您的IP地址、浏览器类型、访问时间以及您在本网站和其他网站上查看的内容。', en: 'We use third-party advertising services (such as Google AdSense) to display ads on our website. These advertising services may use cookies and web beacons to collect information about your visits to this and other websites in order to provide advertisements about goods and services of interest to you. The information collected may include your IP address, browser type, time of visit, and content you view on this and other websites.' },
        privacyCookiesManage: { zh: '管理Cookie偏好', en: 'Managing Cookie Preferences' },
        privacyCookiesManageText: { zh: '您可以通过浏览器设置管理Cookie偏好，包括禁用Cookie或删除已存储的Cookie。请注意，禁用Cookie可能会影响网站的部分功能。此外，您可以通过访问Google的广告设置页面（https://adssettings.google.com）来选择退出个性化广告。', en: 'You can manage your cookie preferences through your browser settings, including disabling cookies or deleting stored cookies. Please note that disabling cookies may affect some features of the website. Additionally, you can opt out of personalized advertising by visiting Google\'s Ads Settings page (https://adssettings.google.com).' },
        privacyUse: { zh: '我们如何使用信息', en: 'How We Use Information' },
        privacyUseText: { zh: '我们不直接收集或存储个人身份信息。第三方广告服务收集的信息仅用于提供和优化广告展示。游戏相关数据完全保留在您的本地设备上。', en: 'We do not directly collect or store personally identifiable information. Information collected by third-party advertising services is used solely for delivering and optimizing ad display. Game-related data remains entirely on your local device.' },
        privacySecurity: { zh: '数据安全', en: 'Data Security' },
        privacySecurityText: { zh: '游戏数据不会传输或存储在我们的服务器上。对于第三方广告服务，他们有自己的安全措施来保护收集的数据。我们建议您定期查看这些第三方服务的隐私政策以了解其数据保护措施。', en: 'Game data is not transmitted or stored on our servers. For third-party advertising services, they have their own security measures to protect collected data. We recommend that you regularly review the privacy policies of these third-party services to understand their data protection measures.' },
        privacyThirdParty: { zh: '第三方服务', en: 'Third-Party Services' },
        privacyThirdPartyText: { zh: '本网站集成了第三方广告服务（如Google AdSense）。这些服务有自己的隐私政策，我们建议您查看Google的隐私政策（https://policies.google.com/privacy）以了解他们如何收集、使用和保护您的信息。', en: 'This website integrates third-party advertising services (such as Google AdSense). These services have their own privacy policies, and we recommend that you review Google\'s Privacy Policy (https://policies.google.com/privacy) to understand how they collect, use, and protect your information.' },
        privacyChanges: { zh: '本政策的变更', en: 'Changes to This Policy' },
        privacyChangesText: { zh: '我们可能会不时更新本隐私政策，包括对我们的广告合作伙伴或Cookie使用政策的更改。任何变更都将反映在本页面上，重大变更将在页面顶部显著提示。', en: 'We may update this Privacy Policy from time to time, including changes to our advertising partners or cookie usage policies. Any changes will be reflected on this page, and significant changes will be prominently noted at the top of the page.' },
        privacyContact: { zh: '联系我们', en: 'Contact Us' },
        privacyContactText: { zh: '如果您对本隐私政策有任何疑问，请通过 main@setup.de5.net 联系我们。', en: 'If you have any questions about this Privacy Policy, please contact us at main@setup.de5.net.' },
        contactTitle: { zh: '联系我们', en: 'Contact Us' },
        contactGetInTouch: { zh: '保持联系', en: 'Get in Touch' },
        contactDesc: { zh: '我们很乐意听取您的意见！无论您对我们的国际象棋网站有疑问、反馈或建议，请随时与我们联系。', en: 'We would love to hear from you! Whether you have questions, feedback, or suggestions about our chess website, feel free to reach out.' },
        contactInfo: { zh: '联系信息', en: 'Contact Information' },
        contactEmailLabel: { zh: '邮箱：', en: 'Email: ' },
        contactHow: { zh: '如何联系我们', en: 'How to Reach Us' },
        contactHowText: { zh: '您可以向我们发送电子邮件询问，我们会尽快回复。请包含明确的主题行和详细的消息。', en: 'You can send us an email with your inquiries, and we will get back to you as soon as possible. Please include a clear subject line and detailed message.' },
        contactSupport: { zh: '技术支持', en: 'Support' },
        contactSupportText: { zh: '对于技术问题或功能请求，请尽可能提供详细信息，包括您的浏览器版本和重现问题的步骤。', en: 'For technical issues or feature requests, please provide as much detail as possible, including your browser version and steps to reproduce any problems.' },
        footerCopyright: { zh: '版权所有', en: 'All Rights Reserved' }
    };

    function translateText(key) {
        return (translations[key] && translations[key][currentLanguage]) || '';
    }

    function translateUI() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const text = translateText(key);
            if (text) {
                el.textContent = text;
            }
        });
    }

    function setLanguage(lang) {
        currentLanguage = lang;
        document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
        translateUI();
    }

    // Language switching
    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
        languageSelect.addEventListener('change', function() {
            setLanguage(this.value);
        });
    }

    // Initialize
    translateUI();
});
