import userLiveViewsController from '@/controller/user_live_views.controller';
import Router from 'koa-router';

const userLiveViewsRouter = new Router({ prefix: '/user_live_views' });

/** 创建用户观看直播记录 */
userLiveViewsRouter.post('/create', userLiveViewsController.create);

/** 获取用户观看直播记录列表 */
userLiveViewsRouter.get('/list', userLiveViewsController.list);

/** 获取单个用户观看直播记录 */
userLiveViewsRouter.get('/find/:id', userLiveViewsController.find);

/** 更新用户观看直播记录（例如观看时长） */
userLiveViewsRouter.put('/update/:id', userLiveViewsController.update);

/** 软删除用户观看直播记录 */
userLiveViewsRouter.delete(
  '/soft_delete/:id',
  userLiveViewsController.softDelete
);

/** 硬删除用户观看直播记录 */
userLiveViewsRouter.put('/delete', userLiveViewsController.delete);

export default userLiveViewsRouter;
