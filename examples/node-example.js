/**
 * Node.js 使用示例
 * 
 * 运行方式:
 * 1. 先构建 SDK: npm run build
 * 2. 运行示例: node examples/node-example.js
 */

const { AnalyticsClient } = require('../dist/index.js');

// 配置
const config = {
  serverUrl: 'http://localhost:8080',
  productName: 'NodeTestApp',
  debug: true,
  batchSize: 5,
  flushInterval: 5000,
};

// 创建客户端
const client = new AnalyticsClient(config);

console.log('=== Analytics Client Node.js 示例 ===\n');
console.log('配置:', {
  serverUrl: config.serverUrl,
  productName: config.productName,
  deviceId: client.getDeviceId(),
});

// 示例函数
async function runExamples() {
  try {
    console.log('\n1. 追踪简单事件...');
    await client.trackEvent('app_start', {
      version: '1.0.0',
      platform: 'node',
    });
    console.log('✓ 事件已追踪');

    console.log('\n2. 追踪用户操作...');
    await client.trackAction('user', 'login', 'email', 1.0, {
      method: 'password',
    });
    console.log('✓ 用户操作已追踪');

    console.log('\n3. 追踪页面浏览...');
    await client.trackPageView('/dashboard', 'Dashboard', {
      referrer: '/home',
    });
    console.log('✓ 页面浏览已追踪');

    console.log('\n4. 批量追踪多个事件...');
    await client.trackEvent('feature_used', { feature: 'search' });
    await client.trackEvent('feature_used', { feature: 'filter' });
    await client.trackEvent('feature_used', { feature: 'export' });
    console.log('✓ 批量事件已追踪');

    console.log('\n5. 上报安装事件...');
    const installResponse = await client.reportInstall({
      app_version: '1.0.0',
    });
    console.log('✓ 安装事件响应:', installResponse);

    console.log('\n6. 验证 License...');
    const licenseStatus = await client.verifyLicense();
    console.log('✓ License 状态:', licenseStatus);

    console.log('\n7. 获取统计信息...');
    const statsResponse = await client.getStats();
    console.log('✓ 统计信息:', statsResponse.data);

    console.log('\n8. 查询事件...');
    const eventsResponse = await client.queryEvents({
      page: 1,
      page_size: 5,
    });
    console.log('✓ 事件列表:', eventsResponse.data);

    console.log('\n9. 获取事件统计...');
    const eventStatsResponse = await client.getEventStats();
    console.log('✓ 事件统计:', eventStatsResponse.data);

    console.log('\n10. 获取事件类型...');
    const eventTypesResponse = await client.getEventTypes();
    console.log('✓ 事件类型:', eventTypesResponse.data);

    console.log('\n11. 手动刷新事件队列...');
    console.log('当前队列大小:', client.getQueueSize());
    const flushSuccess = await client.flush();
    console.log('✓ 刷新结果:', flushSuccess ? '成功' : '失败');
    console.log('刷新后队列大小:', client.getQueueSize());

    console.log('\n=== 所有示例执行完成 ===\n');
  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    // 销毁客户端
    console.log('销毁客户端...');
    client.destroy();
    console.log('✓ 客户端已销毁');
  }
}

// 运行示例
runExamples();
