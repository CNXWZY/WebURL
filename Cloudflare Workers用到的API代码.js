// worker.js - 统一版，前后台共用一套API端点
// 环境变量配置：
// ADMIN_PASSWORD: 管理员密码（默认：）
// DB: D1数据库绑定
//使用方法：复制本文档全部代码 打开https://dash.cloudflare.com/   左边菜单：计算 (Workers) ——创建workers之后——复制本代码放上去 点击部署即可

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const method = request.method;

    // 设置 CORS 头
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // 处理预检请求
    if (method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders,
      });
    }

    try {
      // ==================== 统一API端点（前后台共用） ====================
      if (pathname.startsWith('/api/bookmarks')) {
        // 获取所有书签
        if (method === 'GET' && pathname === '/api/bookmarks') {
          const category = url.searchParams.get('category');
          let query = `
            SELECT id, title, url, category, description, created_at, updated_at 
            FROM bookmarks 
            ORDER BY created_at DESC
          `;
          
          if (category) {
            query = `
              SELECT id, title, url, category, description, created_at, updated_at 
              FROM bookmarks 
              WHERE category = ? 
              ORDER BY created_at DESC
            `;
          }
          
          const { results } = category 
            ? await env.DB.prepare(query).bind(category).all()
            : await env.DB.prepare(query).all();
          
          return Response.json({
            success: true,
            data: results
          }, {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }

        // 获取单个书签
        if (method === 'GET' && pathname.startsWith('/api/bookmarks/')) {
          // 排除特殊端点
          if (pathname.includes('/categories') || pathname.includes('/export') || pathname.includes('/import')) {
            // 继续处理下面的特殊端点
          } else {
            const id = pathname.split('/').pop();
            const result = await env.DB.prepare(`
              SELECT id, title, url, category, description, created_at, updated_at 
              FROM bookmarks WHERE id = ?
            `).bind(id).first();
            
            if (!result) {
              return Response.json({
                success: false,
                error: '书签不存在'
              }, {
                status: 404,
                headers: {
                  'Content-Type': 'application/json',
                  ...corsHeaders
                }
              });
            }
            
            return Response.json({
              success: true,
              data: result
            }, {
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
        }

        // 创建书签
        if (method === 'POST' && pathname === '/api/bookmarks') {
          const body = await request.json();
          const { title, url, category, description } = body;
          
          if (!title || !url) {
            return Response.json({
              success: false,
              error: '标题和URL是必填项'
            }, {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          const { success, meta } = await env.DB.prepare(`
            INSERT INTO bookmarks (title, url, category, description)
            VALUES (?, ?, ?, ?)
          `).bind(title, url, category || '未分类', description || '').run();
          
          if (success) {
            const newBookmark = await env.DB.prepare(`
              SELECT id, title, url, category, description, created_at, updated_at 
              FROM bookmarks WHERE id = ?
            `).bind(meta.last_row_id).first();
            
            return Response.json({
              success: true,
              data: newBookmark
            }, {
              status: 201,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
        }

        // 更新书签
        if (method === 'PUT' && pathname.startsWith('/api/bookmarks/')) {
          // 排除特殊端点
          if (pathname.includes('/categories') || pathname.includes('/export') || pathname.includes('/import')) {
            // 继续处理下面的特殊端点
          } else {
            const id = pathname.split('/').pop();
            const body = await request.json();
            const { title, url, category, description } = body;
            
            const { success } = await env.DB.prepare(`
              UPDATE bookmarks 
              SET title = ?, url = ?, category = ?, description = ?, updated_at = datetime('now')
              WHERE id = ?
            `).bind(title, url, category, description || '', id).run();
            
            if (success) {
              const updatedBookmark = await env.DB.prepare(`
                SELECT id, title, url, category, description, created_at, updated_at 
                FROM bookmarks WHERE id = ?
              `).bind(id).first();
              
              return Response.json({
                success: true,
                data: updatedBookmark
              }, {
                headers: {
                  'Content-Type': 'application/json',
                  ...corsHeaders
                }
              });
            }
          }
        }

        // 删除书签
        if (method === 'DELETE' && pathname.startsWith('/api/bookmarks/')) {
          // 排除特殊端点
          if (pathname.includes('/categories') || pathname.includes('/export') || pathname.includes('/import')) {
            // 继续处理下面的特殊端点
          } else {
            const id = pathname.split('/').pop();
            
            const { success } = await env.DB.prepare(`
              DELETE FROM bookmarks WHERE id = ?
            `).bind(id).run();
            
            return Response.json({
              success: true,
              message: '书签已删除'
            }, {
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
        }

        // 获取所有分类 - 使用 /api/bookmarks/categories
        if (method === 'GET' && pathname === '/api/bookmarks/categories') {
          const { results } = await env.DB.prepare(`
            SELECT DISTINCT category FROM bookmarks ORDER BY category
          `).all();
          
          const categories = results.map(r => r.category).filter(c => c && c.trim() !== '');
          
          return Response.json(categories, {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }

        // 添加分类 - 使用 /api/bookmarks/categories
        if (method === 'POST' && pathname === '/api/bookmarks/categories') {
          const body = await request.json();
          const { category } = body;
          
          if (!category) {
            return Response.json({
              success: false,
              error: '分类名称不能为空'
            }, {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          // 检查分类是否已存在
          const { results } = await env.DB.prepare(`
            SELECT DISTINCT category FROM bookmarks WHERE category = ?
          `).bind(category).all();
          
          if (results.length > 0) {
            return Response.json({
              success: false,
              error: '分类已存在'
            }, {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          // 添加一个示例网址来创建新分类
          await env.DB.prepare(`
            INSERT INTO bookmarks (title, url, category, description)
            VALUES (?, ?, ?, ?)
          `).bind('示例网址', 'https://example.com', category, '示例网址').run();
          
          return Response.json({
            success: true,
            message: '分类添加成功'
          }, {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }

        // 删除分类 - 使用 /api/bookmarks/categories/:category
        if (method === 'DELETE' && pathname.startsWith('/api/bookmarks/categories/')) {
          const category = decodeURIComponent(pathname.split('/').pop());
          
          const { success } = await env.DB.prepare(`
            DELETE FROM bookmarks WHERE category = ?
          `).bind(category).run();
          
          return Response.json({
            success: true,
            message: '分类已删除'
          }, {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }

        // 导出数据 - 使用 /api/bookmarks/export
        if (method === 'GET' && pathname === '/api/bookmarks/export') {
          const { results } = await env.DB.prepare(`
            SELECT id, title, url, category, description, created_at, updated_at 
            FROM bookmarks 
            ORDER BY created_at DESC
          `).all();
          
          return Response.json({
            urls: results,
            categories: [...new Set(results.map(r => r.category).filter(c => c && c.trim() !== ''))],
            export_date: new Date().toISOString()
          }, {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }

        // 导入数据 - 使用 /api/bookmarks/import
        if (method === 'POST' && pathname === '/api/bookmarks/import') {
          const body = await request.json();
          const { urls = [] } = body;
          
          let importedCount = 0;
          
          for (const urlData of urls) {
            if (urlData.title && urlData.url) {
              await env.DB.prepare(`
                INSERT INTO bookmarks (title, url, category, description)
                VALUES (?, ?, ?, ?)
              `).bind(
                urlData.title,
                urlData.url,
                urlData.category || '未分类',
                urlData.description || ''
              ).run();
              importedCount++;
            }
          }
          
          return Response.json({
            success: true,
            message: `成功导入 ${importedCount} 个网址`
          }, {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
      }

      // 健康检查
      if (method === 'GET' && pathname === '/health') {
        return Response.json({
          success: true,
          message: '服务运行正常',
          timestamp: new Date().toISOString()
        }, {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

    } catch (error) {
      console.error('API错误:', error);
      return Response.json({
        success: false,
        error: error.message
      }, {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // 未知路由
    return Response.json({
      success: false,
      error: '未找到API端点'
    }, {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
};