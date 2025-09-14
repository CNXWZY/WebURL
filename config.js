// 配置文件 - 请根据实际部署修改
const CONFIG = {
    // API基础URL - 根据你的Cloudflare Workers部署地址修改
    API_BASE_URL: 'https://weburl-cmk.pages.dev',
    
    // 应用配置
    APP_NAME: '我的网址导航',
    
    // 分类选项
    CATEGORIES: [
        '常用', '工作', '学习', '娱乐', '社交', '其他'
    ],
    
    // 分页设置
    ITEMS_PER_PAGE: 50,
    
    // 超时设置（毫秒）
    REQUEST_TIMEOUT: 10000
};

// 导出配置供其他文件使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
