# RunTime_Tracker 前端项目

## 📋 目录

- [前置准备](#前置准备)
- [部署方式](#部署方式)
  - [方法一：Cloudflare Pages 部署（推荐）](#方法一cloudflare-pages-部署推荐)
  - [方法二：自建服务器部署](#方法二自建服务器部署)
- [后续更新](#后续更新)

---

## 前置准备

⚠️ **请先完成后端项目部署**

前端项目依赖后端 API 服务，请先部署后端项目：
👉 [RunTime_Tracker 后端项目](https://github.com/1812z/RunTime_Tracker)

---

## 部署方式

### 方法一：Cloudflare Pages 部署（推荐）

利用 Cloudflare Pages 实现免费、快速部署，支持自动构建和部署。

国内用户建议EdgeOne Pages，同样免费，延迟更低。

#### 步骤

1. **Fork 项目仓库**
   
   点击本仓库右上角的 `Fork` 按钮，创建你自己的仓库副本

2. **创建 Cloudflare Pages 项目**
   
   - 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - 进入 `Pages` 页面，点击 `创建项目`
   - 选择 `连接到 Git`
   - 连接你的 GitHub 账户并授权访问

3. **配置项目**
   
   - 选择你 Fork 的仓库
   - 分支选择：`master`
   - 构建设置：npm run build
   - 构建输出 dist
   - **环境变量配置**：
     - 变量名：`VITE_API_BASE` 
     - 值：你的后端 API 地址（例如：`https://your-api.example.com/api`）
     - ⚠️ 注意：必须保留 `/api` 后缀
   

4. **完成部署**
   
   - 点击 `保存并部署`
   - 等待构建完成（通常需要 1-3 分钟）
   - 部署完成后，Cloudflare 会提供一个 `*.pages.dev` 域名

5. **（可选）配置自定义域名**
   
   在 Pages 项目的 `自定义域` 选项卡中添加你自己的域名

---

### 方法二：自建服务器部署

适合需要完全控制部署环境的场景。

#### 环境要求

- Node.js 版本 22 或更高

#### 步骤

1. **克隆项目**
```bash
   git clone https://github.com/1812z/RunTime_Tracker_Web.git
   cd RunTime_Tracker_Web
```

2. **配置后端 API 地址**
   
   编辑 `config.js` 文件：
```javascript
   const config = {
       dev: {
           API_BASE: 'https://your-api.example.com/api',  // 修改为你的后端地址
           // ...
       },
       prod: {
           API_BASE: 'https://your-api.example.com/api',  // 修改为你的后端地址
           // ...
       }
   };
```
   
   > ⚠️ **重要**：必须保留 `/api` 后缀

3. **构建项目**
```bash
   # 安装依赖
   npm install
   
   # 构建生产版本
   npm run build
```
   
   构建完成后，静态文件将生成在 `/dist` 目录下

4. **部署到静态服务器**
   
   将 `/dist` 目录下的所有文件部署到你的静态文件服务器（Nginx、Apache、Caddy 等）

---

## 后续更新

### Cloudflare Pages 部署

Cloudflare Pages 会自动监听你 Fork 的仓库变化：

1. 在你的 GitHub 仓库页面，点击 `Sync fork` 按钮
2. 点击 `Update branch` 同步上游更新
3. Cloudflare Pages 会自动检测到更改并重新构建部署

### 自建服务器部署

需要手动更新：
```bash
# 拉取最新代码
git pull origin master

# 重新安装依赖（如有更新）
npm install

# 重新构建
npm run build

# 更新服务器上的文件
# 将 dist 目录的内容复制到你的 web 服务器目录
```

---

**相关链接：**
- 📦 后端项目：[RunTime_Tracker](https://github.com/1812z/RunTime_Tracker)
- 📖 使用文档：查看完整使用指南
- 💬 交流反馈：提交 Issue 或 PR
