import liveRoomPreviewsController from '@/controller/live_room_previews.controller';
import Router from 'koa-router';

const liveRoomPreviewsRouter = new Router({ prefix: '/live_room_previews' });

/**
 * 获取直播预告列表
 * 请求示例：GET /api/live_room_previews?userId=1&page=1&size=10
 */
liveRoomPreviewsRouter.get('/list', liveRoomPreviewsController.getList);

/**
 * 创建直播预告
 * 请求示例：POST /api/live_room_previews
 * 请求体：{ user_id: 1, title: 'My Stream', preview_date: '2023-10-10', cover_image: 'image_url' }
 */
liveRoomPreviewsRouter.post('/create', liveRoomPreviewsController.create);

/**
 * 删除直播预告
 * 请求示例：DELETE /api/live_room_previews?id=1
 */
liveRoomPreviewsRouter.put('/delete', liveRoomPreviewsController.delete);

export default liveRoomPreviewsRouter;
