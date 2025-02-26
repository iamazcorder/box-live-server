import { IList } from '@/interface';
import liveRoomAppointmentModel, {
  IAppointment,
} from '@/model/live_room_appointments.model';
import liveRoomPreviewModel from '@/model/live_room_previews.model';
import userModel from '@/model/user.model';
import {
  handleKeyWord,
  handleOrder,
  handlePage,
  handlePaging,
  handleRangTime,
} from '@/utils';
import { deleteUseLessObjectKey } from 'billd-utils'; // 确保这个函数能处理一个对象
import { Op } from 'sequelize';

class LiveRoomAppointmentsService {
  /** 检查直播预约是否存在 */
  async isExist(ids: number[]) {
    const count = await liveRoomAppointmentModel.count({
      where: {
        id: {
          [Op.in]: ids, // 检查是否有这些ID的记录
        },
      },
    });
    return count === ids.length; // 如果数量和传入的 IDs 一样，则说明全都存在
  }
  /** 检查指定 userId 和 ids 的直播预约是否都存在 */
  async isExistByUser(userId: number, ids: number[]) {
    const count = await liveRoomAppointmentModel.count({
      where: {
        preview_id: {
          [Op.in]: ids, // 检查是否有这些 ID 的记录
        },
        user_id: userId, // 确保是该用户的预约
      },
    });
    return count === ids.length; // 如果数量和传入的 IDs 一样，则说明全都存在
  }
  /** 获取直播预约列表 */
  async getList({
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
  }: IList<IAppointment>) {
    const { offset, limit } = handlePage({ nowPage, pageSize });

    // 获取当前时间
    const currentTime = new Date();

    // 合并查询条件并删除无用的字段
    const allWhere: any = deleteUseLessObjectKey({
      id,
      user_id,
      preview_id,
      notification_status,
      appointment_time,
      notification_time,
    });

    const keyWordWhere = handleKeyWord({
      keyWord,
      arr: ['appointment_time', 'notification_time'],
    });
    if (keyWordWhere) {
      allWhere[Op.or] = keyWordWhere;
    }

    const rangTimeWhere = handleRangTime({
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    });
    if (rangTimeWhere) {
      allWhere[rangTimeType!] = rangTimeWhere;
    }

    // 添加条件，排除 preview_date 小于当前时间的记录
    allWhere['$preview.preview_date$'] = {
      [Op.gt]: currentTime, // 只返回 preview_date 大于当前时间的记录
    };

    const orderRes = handleOrder({ orderName, orderBy });

    // 使用 include 来加载关联的预告数据及对应的用户信息
    const result = await liveRoomAppointmentModel.findAndCountAll({
      distinct: true,
      order: [
        ...orderRes,
        ['preview', 'preview_date', 'ASC'], // 按 preview_date 从前到后排序
      ],
      limit,
      offset,
      where: { ...allWhere },
      include: [
        {
          model: liveRoomPreviewModel,
          as: 'preview', // 使用关联的别名
          required: true, // 确保每个预约都有对应的预告信息
          include: [
            {
              model: userModel, // 关联 userModel
              as: 'user', // 使用关联的别名
              required: true, // 确保每个预告都包含用户信息
              attributes: ['id', 'username'], // 选择你需要的用户字段
            },
          ],
        },
      ],
    });

    // 返回分页处理后的结果
    return handlePaging(result, nowPage, pageSize);
  }
  /** 查找直播预约 */
  async find(id: number) {
    return await liveRoomAppointmentModel.findOne({ where: { id } });
  }

  /** 创建直播预约 */
  async create(data: IAppointment) {
    const result = await liveRoomAppointmentModel.create(data);
    return result;
  }

  /** 更新直播预约 */
  async update(data: {
    id: number;
    appointment_time?: Date;
    notification_status?: number;
  }) {
    const { id } = data;
    const dataToUpdate = deleteUseLessObjectKey(data); // 只传递 data 对象
    return await liveRoomAppointmentModel.update(dataToUpdate, {
      where: { id },
      limit: 1,
    });
  }

  /** 删除直播预约 */
  async delete(id: number) {
    return await liveRoomAppointmentModel.destroy({
      where: { id },
      limit: 1,
      individualHooks: true,
    });
  }

  /** 批量删除直播预约 */
  async deleteBatch(userId: number, ids: number[]) {
    return await liveRoomAppointmentModel.destroy({
      where: {
        preview_id: {
          [Op.in]: ids, // 使用 IN 条件批量删除
        },
        user_id: userId, // 确保删除的是属于指定 userId 的预约
      },
      individualHooks: true, // 确保每个记录的钩子都会触发
    });
  }
}

export default new LiveRoomAppointmentsService();
