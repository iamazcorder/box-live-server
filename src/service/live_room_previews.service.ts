import { COMMON_HTTP_CODE } from '@/constant';
import { IList } from '@/interface';
import { CustomError } from '@/model/customError.model';
import LiveRoomAppointmentModel from '@/model/live_room_appointments.model';
import liveRoomPreviewModel, {
  IPreview,
} from '@/model/live_room_previews.model';
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

class LiveRoomPreviewsService {
  /** 检查直播预告是否存在 */
  async isExist(ids: number[]) {
    const count = await liveRoomPreviewModel.count({
      where: {
        id: {
          [Op.in]: ids, // 检查是否有这些ID的记录
        },
      },
    });
    return count === ids.length; // 如果数量和传入的 IDs 一样，则说明全都存在
  }

  /** 获取直播预告列表 */
  async getList({
    id,
    user_id,
    title,
    preview_date,
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<IPreview>) {
    const { offset, limit } = handlePage({ nowPage, pageSize });

    // 获取当前时间
    const currentTime = new Date();

    // 合并查询条件并删除无用的字段
    const allWhere: any = deleteUseLessObjectKey({
      id,
      user_id,
      title,
      preview_date,
    });

    const keyWordWhere = handleKeyWord({ keyWord, arr: ['title'] });
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

    // 添加条件，排除 preview_date 小于等于当前时间的记录
    allWhere.preview_date = {
      [Op.gt]: currentTime, // 只返回 preview_date 大于当前时间的记录
    };

    const orderRes = handleOrder({ orderName, orderBy });

    // 查询直播预告列表并关联用户信息
    const result = await liveRoomPreviewModel.findAndCountAll({
      distinct: true,
      order: [
        ...orderRes,
        ['preview_date', 'ASC'], // 按 preview_date 从前到后排序
      ],
      limit,
      offset,
      where: { ...allWhere },
      include: [
        {
          model: userModel, // 关联 userModel
          as: 'user', // 别名，根据关联关系定义
          required: true, // 确保每个预告都有对应的用户信息
          attributes: ['id', 'username'], // 选择需要的用户字段（例如id, username）
        },
      ],
    });

    // 返回分页处理后的结果
    return handlePaging(result, nowPage, pageSize);
  }
  /** 查找直播预告 */
  async find(id: number) {
    return await liveRoomPreviewModel.findOne({ where: { id } });
  }

  /** 创建直播预告 */
  async create(data: IPreview) {
    const result = await liveRoomPreviewModel.create(data);
    return result;
  }

  /** 更新直播预告 */
  async update(data: {
    id: number;
    title?: string;
    preview_date?: Date;
    cover_image?: string;
  }) {
    const { id } = data;
    const dataToUpdate = deleteUseLessObjectKey(data); // 这里只传递 data 对象
    return await liveRoomPreviewModel.update(dataToUpdate, {
      where: { id },
      limit: 1,
    });
  }

  /** 删除直播预告 */
  async delete(id: number) {
    return await liveRoomPreviewModel.destroy({
      where: { id },
      limit: 1,
      individualHooks: true,
    });
  }

  /** 批量删除直播预约，并删除对应的预告数据 */
  async deleteBatch(ids: number[]) {
    try {
      // 1. 删除 liveRoomAppointmentsModel 中 preview_id 为传入 ids 中的数据
      const result = await LiveRoomAppointmentModel.destroy({
        where: {
          preview_id: {
            [Op.in]: ids, // 根据 preview_id 批量删除
          },
        },
        individualHooks: true, // 如果需要处理每个删除的钩子，可以设置此项
      });

      if (result === 0) {
        throw new CustomError(
          '没有找到要删除的直播预约记录！',
          COMMON_HTTP_CODE.paramsError,
          COMMON_HTTP_CODE.paramsError
        );
      }

      // 2. 获取删除的预约记录中对应的 preview_id，并删除对应的预告数据
      const previewIdsToDelete = ids; // 因为是批量删除 preview_id 为 ids 中的数据，所以直接用 ids

      if (previewIdsToDelete.length > 0) {
        // 删除 liveRoomPreviewModel 中对应 preview_id 的数据
        const previewDeleteResult = await liveRoomPreviewModel.destroy({
          where: {
            id: {
              [Op.in]: previewIdsToDelete, // 使用 preview_id 批量删除
            },
          },
          individualHooks: true, // 确保每个记录的钩子都会触发
        });

        if (previewDeleteResult === 0) {
          throw new CustomError(
            '没有找到要删除的直播预告记录！',
            COMMON_HTTP_CODE.paramsError,
            COMMON_HTTP_CODE.paramsError
          );
        }
      }

      return result; // 返回删除的数量
    } catch (error: any) {
      throw new CustomError(
        '批量删除失败！' + error.message,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
  }
}

export default new LiveRoomPreviewsService();
