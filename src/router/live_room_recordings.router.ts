import { apiVerifyAuth } from '@/app/verify.middleware';
import { DEFAULT_AUTH_INFO } from '@/constant';
import liveRoomRecordingController from '@/controller/live_room_recordings.controller';
import Router from 'koa-router';

const liveRoomRecordingRouter = new Router({ prefix: '/live_room_recordings' });

// 创建直播回放（支持上传视频）
liveRoomRecordingRouter.post('/create', liveRoomRecordingController.create);

// 获取直播回放列表
liveRoomRecordingRouter.get('/list', liveRoomRecordingController.list);

// 获取单个直播回放
liveRoomRecordingRouter.get('/find/:id', liveRoomRecordingController.find);

// 更新直播回放（修改标题或URL）
liveRoomRecordingRouter.put(
  '/update/:id',
  apiVerifyAuth([DEFAULT_AUTH_INFO.USER_MANAGE.auth_value]),
  liveRoomRecordingController.update
);

// 软删除直播回放
liveRoomRecordingRouter.put(
  '/soft_delete/:id',
  apiVerifyAuth([DEFAULT_AUTH_INFO.USER_MANAGE.auth_value]),
  liveRoomRecordingController.softDelete
);

// 硬删除直播回放（永久删除）
liveRoomRecordingRouter.put('/delete', liveRoomRecordingController.delete);

export default liveRoomRecordingRouter;
