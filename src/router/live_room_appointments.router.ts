import liveRoomAppointmentsController from '@/controller/live_room_appointments.controller';
import Router from 'koa-router';

const liveRoomAppointmentsRouter = new Router({
  prefix: '/live_room_appointments',
});

/**
 * 获取直播预约列表
 * 请求示例：GET /api/live_room_appointments?userId=1&page=1&size=10
 */
liveRoomAppointmentsRouter.get('/list', liveRoomAppointmentsController.getList);

/**
 * 创建直播预约
 * 请求示例：POST /api/live_room_appointments
 * 请求体：{ user_id: 1, preview_id: 2, appointment_time: '2023-10-12 10:00:00', notification_time: '2023-10-12 09:55:00', notification_status: 0 }
 */
liveRoomAppointmentsRouter.post(
  '/create',
  liveRoomAppointmentsController.create
);

/**
 * 删除直播预约
 * PUT /api/live_room_appointments?id=1&userId=1
 */
liveRoomAppointmentsRouter.put(
  '/delete',
  liveRoomAppointmentsController.delete
);

export default liveRoomAppointmentsRouter;
