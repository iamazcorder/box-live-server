import userVideosController from '@/controller/user_videos.controller';
import Router from 'koa-router';

const userVideosRouter = new Router({ prefix: '/user_videos' });

/** 创建用户视频 */
userVideosRouter.post('/create', userVideosController.create);

/** 获取用户视频列表 */
userVideosRouter.get('/list', userVideosController.list);

/** 获取单个用户视频 */
userVideosRouter.get('/find/:id', userVideosController.find);

/** 更新用户视频 */
userVideosRouter.put('/update/:id', userVideosController.update);

/** 软删除用户视频 */
userVideosRouter.delete('/soft_delete/:id', userVideosController.softDelete);

/** 硬删除用户视频 */
userVideosRouter.put('/delete', userVideosController.delete);

export default userVideosRouter;
