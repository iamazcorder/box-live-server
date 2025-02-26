import successHandler from '@/app/handler/success-handle';
import { COMMON_HTTP_CODE } from '@/constant';
import { IList } from '@/interface';
import { CustomError } from '@/model/customError.model';
import { IAppointment } from '@/model/live_room_appointments.model';
import liveRoomAppointmentsService from '@/service/live_room_appointments.service';
import { ParameterizedContext } from 'koa';

class LiveRoomAppointmentsController {
  common = {
    /** 获取直播预约列表 */
    getList: async (data) => {
      const {
        id,
        user_id,
        preview_id,
        appointment_time,
        notification_time,
        notification_status,
        orderBy,
        orderName,
        nowPage,
        pageSize,
        keyWord,
        rangTimeType,
        rangTimeStart,
        rangTimeEnd,
      }: IList<IAppointment> = data;
      const result = await liveRoomAppointmentsService.getList({
        id,
        user_id,
        preview_id,
        appointment_time,
        notification_time,
        notification_status,
        nowPage,
        pageSize,
        orderBy,
        orderName,
        keyWord,
        rangTimeType,
        rangTimeStart,
        rangTimeEnd,
      });
      return result;
    },
    /** 检查直播预约是否存在 */
    isExist: async (ids: number[]) => {
      const isExist = await liveRoomAppointmentsService.isExist(ids);
      if (!isExist) {
        throw new CustomError(
          `不存在id为${ids.join()}的直播预约！`,
          COMMON_HTTP_CODE.paramsError,
          COMMON_HTTP_CODE.paramsError
        );
      }
    },
    /** 删除直播预约 */
    delete: async (id: number, isRoute?: boolean) => {
      const isExist = await liveRoomAppointmentsService.isExist([id]);
      if (!isExist) {
        if (isRoute) {
          throw new CustomError(
            `不存在id为${id}的直播预约！`,
            COMMON_HTTP_CODE.paramsError,
            COMMON_HTTP_CODE.paramsError
          );
        }
      } else {
        await liveRoomAppointmentsService.delete(id);
      }
    },
    /** 批量删除直播预约 */
    deleteBatch: async (userId: number, ids: number[]) => {
      // 首先检查这些 id 是否都存在，并且属于指定的 userId
      const isExist = await liveRoomAppointmentsService.isExistByUser(
        userId,
        ids
      );
      if (!isExist) {
        throw new CustomError(
          `不存在userId为${userId}，且id为${ids.join()}的直播预约！`,
          COMMON_HTTP_CODE.paramsError,
          COMMON_HTTP_CODE.paramsError
        );
      }
      // 调用服务层的批量删除方法，传递 userId 和 ids
      await liveRoomAppointmentsService.deleteBatch(userId, ids);
    },
  };

  /** 获取直播预约列表 */
  getList = async (ctx: ParameterizedContext, next) => {
    const {
      userId,
      page = 1,
      size = 10,
      previewId,
      appointmentTime,
      notificationTime,
      notificationStatus,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    } = ctx.request.query;

    // 默认分页参数
    const nowPage = Number(page);
    const pageSize = Number(size);

    const result = await this.common.getList({
      user_id: userId ? Number(userId) : undefined, // 过滤条件
      preview_id: previewId ? Number(previewId) : undefined,
      appointment_time: appointmentTime,
      notification_time: notificationTime,
      notification_status: notificationStatus
        ? Number(notificationStatus)
        : undefined,
      nowPage,
      pageSize,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    });
    successHandler({ ctx, data: result });
    await next();
  };

  /** 查找指定直播预约 */
  find = async (ctx: ParameterizedContext, next) => {
    const { id } = ctx.request.query; // 获取查询参数中的 id
    if (!id) {
      throw new CustomError(
        '缺少 id 参数！',
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }

    const result = await liveRoomAppointmentsService.find(Number(id));
    successHandler({ ctx, data: result });
    await next();
  };

  /** 创建直播预约 */
  create = async (ctx: ParameterizedContext, next) => {
    const {
      user_id,
      preview_id,
      appointment_time,
      notification_time,
      notification_status = 0,
    }: IAppointment = ctx.request.body;
    await liveRoomAppointmentsService.create({
      user_id,
      preview_id,
      appointment_time,
      notification_time,
      notification_status,
    });
    successHandler({ ctx });
    await next();
  };

  /** 批量删除直播预约 */
  delete = async (ctx: ParameterizedContext, next) => {
    const { userId, ids } = ctx.request.body; // 通过请求体获取 userId 和 ids 参数，ids 是一个数组
    if (!userId || !ids || !Array.isArray(ids) || ids.length === 0) {
      throw new CustomError(
        '缺少 userId 或 ids 参数，或参数格式不正确！',
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }

    // 批量删除
    await this.common.deleteBatch(userId, ids); // 调用批量删除方法

    successHandler({ ctx });
    await next();
  };
}

export default new LiveRoomAppointmentsController();
