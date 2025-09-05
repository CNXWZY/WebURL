# 🔖 WebURL - 个人网址收藏导航

一个基于 **Cloudflare Workers免费服务** 的个人网址收藏管理系统，专为解决浏览器收藏夹易丢失、难同步的痛点而设计。

> 💡 **开发背景**：厌倦了浏览器收藏夹经常丢失的烦恼？WebURL 让您用零成本获得专业级的网址管理服务！

最大的亮点就是零成本部署，静态网页，无服务器环境要求，API方式传递数据，采用的是 cloudflare pages+cloudflare workers+cloudflare d1数据库 免费空间数据库

cloudflare workers免费提供的域名因为DNS污染无法访问，请绑定自己的域名或者申请免费域名绑定上去，然后api地址就填自己绑定在workers的域名

免费域名申请：https://domain.digitalplat.org/

## 功能特点

### ✅ 已实现功能
- [x] 网址的添加、编辑、删除
- [x] 按分类筛选网址，**支持自定义分类**
- [x] 实时搜索功能
- [x] 数据导入/导出（JSON格式）
- [x] 响应式设计，支持移动端
- [x] 现代化UI界面
- [x] Cloudflare D1数据库集成
- [x] 错误处理和加载状态
- [x] **明暗主题切换**与持久化存储
- [x] **自动获取网站favicon**

### 🔍 搜索功能
- 支持按网站名称、URL、分类搜索
- 实时搜索（输入时自动过滤）
- 清除搜索按钮
- 键盘快捷键支持（回车搜索）
- 空结果友好提示

### 🎨 主题系统
- **明暗主题**：一键切换浅色/深色主题
- **持久化存储**：主题选择自动保存到本地存储
- **平滑过渡**：主题切换动画效果

### 📂 自定义分类
- **动态添加**：随时添加新的分类
- **本地存储**：自定义分类自动保存
- **即时生效**：添加后立即可用

### 📱 响应式设计
- 桌面端：网格布局，侧边栏管理
- 移动端：单列布局，底部导航
- 自适应卡片布局

## 🛠️ 技术架构 - 全免费方案

### 核心技术栈（零成本）
- **前端**：纯HTML5/CSS3/JavaScript (无框架依赖)
- **部署**：Cloudflare Pages (无限请求，无限带宽)
- **后端**：Cloudflare Workers (每日10万次请求免费额度)
- **数据库**：Cloudflare D1 (5GB存储，免费额度充足)
- **域名**：支持自定义域名 + Cloudflare免费SSL
- **CDN**：全球300+节点加速

### 🎯 为什么选择 Cloudflare 全栈？
- **零服务器成本**：完全免费，适合个人项目
- **全球加速**：无论在哪里访问都快速
- **自动备份**：数据安全可靠，永不丢失
- **一键部署**：GitHub集成，更新自动部署

## 文件结构

```
├── index.html          # 主应用文件
├── config.js           # 配置文件
├── README.md           # 项目说明
└── assets/            # 静态资源（可选）
```

## 配置说明

### 1. 修改API端点
编辑 `config.js` 文件：

```javascript
const CONFIG = {
    API_BASE_URL: 'https://your-worker-domain.workers.dev',
    APP_NAME: '我的网址导航',
    CATEGORIES: ['常用', '工作', '学习', '娱乐', '社交', '其他']
};
```

### 2. Cloudflare Workers后端
确保你的Workers服务实现了以下API端点：

- `GET /api/bookmarks` - 获取所有网址
- `GET /api/bookmarks?category=工作` - 按分类筛选
- `GET /api/bookmarks?search=关键词` - 搜索网址
- `POST /api/bookmarks` - 添加新网址
- `PUT /api/bookmarks/:id` - 更新网址
- `DELETE /api/bookmarks/:id` - 删除网址
- `GET /api/bookmarks/:id` - 获取单个网址详情

### 3. D1数据库表结构

```sql
CREATE TABLE bookmarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT '其他',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```



## 🚀 一键部署指南（5分钟搞定）

### 📋 准备工作（1分钟）
1. **注册账号**：[Cloudflare](https://dash.cloudflare.com/sign-up) + [GitHub](https://github.com/join)
2. **Fork项目**：点击右上角的 Fork 按钮，复制到您的GitHub

### ⚡ 一键部署（3分钟）
#### 方案A：Cloudflare Pages 一键部署（推荐）
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **Pages** → **创建项目** → **连接GitHub**
3. 选择您fork的 `weburl` 项目
4. 点击 **部署** - 无需任何配置！

#### 方案B：手动部署（备用）
```bash
# 克隆您的fork项目
git clone https://github.com/YOUR_USERNAME/weburl.git
cd weburl

# 安装Wrangler CLI
npm install -g wrangler

# 一键部署
wrangler pages deploy . --project-name=my-weburl
```

### 🔧 配置后端（1分钟）
1. **创建D1数据库**：在Cloudflare Dashboard → D1 → 创建数据库
2. **绑定Workers**：创建Workers服务，绑定到D1数据库
3. **修改配置**：编辑 `config.js` 中的API地址

### 🌐 自定义域名（可选）
- 在Cloudflare Pages设置中添加自定义域名
- 自动获得SSL证书和CDN加速

## 📱 使用指南（新手友好）

### 🏠 前台使用（查看网址）
1. **访问网站**：直接点击卡片即可新标签页打开
2. **搜索网址**：顶部搜索框，支持名称/URL/分类搜索
3. **分类筛选**：点击分类按钮快速筛选
4. **主题切换**：右上角 🌙/☀️ 图标切换明暗主题

### ⚙️ 后台管理（完整功能）
1. **添加网址**：管理面板 → 添加网址 → 填写信息
2. **编辑网址**：点击卡片右上角编辑图标
3. **删除网址**：点击卡片右上角删除图标
4. **批量管理**：支持数据导入/导出

### 🎨 个性化设置
- **自定义分类**：随时添加新的分类标签
- **首字母头像**：自动生成网站名称首字母头像
- **响应式布局**：手机、平板、电脑完美适配

### 💾 数据管理
- **自动同步**：所有设备实时同步
- **本地备份**：支持JSON格式导出/导入
- **永不丢失**：Cloudflare全球备份保障

## 故障排除

### 常见问题

1. **API连接失败**
   - 检查config.js中的API_BASE_URL是否正确
   - 确认Workers服务已部署并运行

2. **数据不显示**
   - 检查浏览器控制台网络请求
   - 确认D1数据库表结构正确

3. **搜索不工作**
   - 确保后端支持search参数
   - 检查网络连接状态

### 浏览器兼容性
- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## 安全认证

### 🔐 管理后台认证系统
- **密码哈希存储**：使用SHA256哈希而非明文存储
- **Token过期机制**：24小时自动过期

### 本地验证模式

- 使用SHA256哈希验证密码
- 生成临时token，24小时过期
- 密码哈希：`admin123` → `482c811da5d5b4bc6d497ffa98491e38a3a05f4d3b9c5f1a5e8c8d8e8a8c8d8e`

## 文件结构更新

```
├── index.html          # 主应用文件（仅查看功能）
├── admin.html          # 管理后台（完整管理功能）
├── config.js           # 配置文件
├── README.md           # 项目说明
```

## 扩展功能

未来可添加的功能：
- [x] 用户认证系统（已实现）
- [x] 网站图标自动获取（已实现）
- [ ] 批量操作
- [ ] 拖拽排序
- [ ] 分享功能
- [ ] 统计图表

## 🌟 项目亮点总结

| 特色功能 | 实现效果 |
|----------|----------|
| **零成本方案** | Cloudflare全栈免费，永久使用 |
| **全球加速** | 300+节点CDN，访问飞快 |
| **永不丢失** | 自动备份，数据安全 |
| **首字母头像** | 智能识别，美观实用 |
| **响应式设计** | 手机/平板/电脑完美适配 |
| **一键部署** | 5分钟完成，新手友好 |

## 📄 许可证

MIT License - 可自由使用、修改、分发

## 🎉 开始使用

**立即开始**：Fork本项目 → 连接Cloudflare Pages → 5分钟拥有您的专属网址导航！

> 💡 **小贴士**：这个项目完全免费，适合个人、小团队使用，再也不用担心收藏夹丢失了！