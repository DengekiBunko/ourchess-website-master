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
        privacyDesc: { zh: '本隐私政策描述了我们如何收集、使用和保护您在使用我们的国际象棋网站时的信息。', en: 'This Privacy Policy describes how we collect, use, and protect your information when you use our chess website.' },
        privacyCollect: { zh: '我们收集的信息', en: 'Information We Collect' },
        privacyCollectText: { zh: '我们的网站设计为在您的浏览器中本地运行，不收集或存储任何个人信息。所有游戏数据、设置和交互都保留在您的设备上。', en: 'Our website is designed to run locally in your browser and does not collect or store any personal information. All game data, settings, and interactions remain on your device.' },
        privacyUse: { zh: '我们如何使用信息', en: 'How We Use Information' },
        privacyUseText: { zh: '由于我们不收集任何数据，因此不使用个人信息。网站完全在客户端运行。', en: 'Since we do not collect any data, there is no usage of personal information. The website functions entirely client-side.' },
        privacySecurity: { zh: '数据安全', en: 'Data Security' },
        privacySecurityText: { zh: '由于没有任何数据传输或存储在我们的服务器上，您的隐私得到完全保护。请确保您的本地环境安全。', en: 'As no data is transmitted or stored on our servers, your privacy is fully protected. Please ensure your local environment is secure.' },
        privacyThirdParty: { zh: '第三方服务', en: 'Third-Party Services' },
        privacyThirdPartyText: { zh: '本网站不与任何收集数据的第三方服务集成。', en: 'This website does not integrate with any third-party services that collect data.' },
        privacyChanges: { zh: '本政策的变更', en: 'Changes to This Policy' },
        privacyChangesText: { zh: '我们可能会不时更新本隐私政策。任何变更都将反映在本页面上。', en: 'We may update this Privacy Policy from time to time. Any changes will be reflected on this page.' },
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
