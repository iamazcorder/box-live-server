import userVideoViewsController from '@/controller/user_video_views.controller';
import Router from 'koa-router';

const userVideoViewsRouter = new Router({ prefix: '/user_video_views' });

/** 创建用户观看记录 */
userVideoViewsRouter.post('/create', userVideoViewsController.create);

/** 获取用户观看记录列表 */
userVideoViewsRouter.get('/list', userVideoViewsController.list);

/** 获取单个用户观看记录 */
userVideoViewsRouter.get('/find/:id', userVideoViewsController.find);

/** 更新用户观看记录（例如观看时长或是否看完） */
userVideoViewsRouter.put('/update/:id', userVideoViewsController.update);

/** 软删除用户观看记录 */
userVideoViewsRouter.delete(
  '/soft_delete/:id',
  userVideoViewsController.softDelete
);

/** 硬删除用户观看记录 */
userVideoViewsRouter.put('/delete', userVideoViewsController.delete);

export default userVideoViewsRouter;
