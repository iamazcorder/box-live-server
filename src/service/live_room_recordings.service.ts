import { deleteUseLessObjectKey } from 'billd-utils';
import { Op } from 'sequelize';

import { IList } from '@/interface';
import categoryModel from '@/model/categories.model';
import liveRoomModel from '@/model/liveRoom.model';
import liveRoomRecordingModel from '@/model/live_room_recordings.model';
import {
  handleKeyWord,
  handleOrder,
  handlePage,
  handlePaging,
  handleRangTime,
} from '@/utils';

class LiveRoomRecordingService {
  /** 是否存在该回放 */
  async isExist(ids: number[]) {
    const res = await liveRoomRecordingModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  /** 获取直播回放列表 */
  async getList({
    id,
    live_room_id,
    parent_category_id,
    child_category_id,
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<any>) {
    const { offset, limit } = handlePage({ nowPage, pageSize });
    const allWhere: any = deleteUseLessObjectKey({
      id,
      live_room_id,
      parent_category_id,
      child_category_id,
    });

    const keyWordWhere = handleKeyWord({
      keyWord,
      arr: ['title'],
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

    const orderRes = handleOrder({ orderName, orderBy });

    const result = await liveRoomRecordingModel.findAndCountAll({
      order: [...orderRes],
      limit,
      offset,
      where: {
        ...allWhere,
      },
      include: [
        {
          model: liveRoomModel,
          as: 'liveRoom',
          attributes: ['id', 'name'],
        },
        {
          model: categoryModel,
          as: 'parentCategory',
          attributes: ['id', 'name'],
        },
        {
          model: categoryModel,
          as: 'childCategory',
          attributes: ['id', 'name'],
        },
      ],
      distinct: true,
    });

    return handlePaging(result, nowPage, pageSize);
  }

  /** 根据id查找直播回放 */
  async find(id: number) {
    const result = await liveRoomRecordingModel.findOne({
      where: { id },
      include: [
        {
          model: liveRoomModel,
          as: 'liveRoom',
          attributes: ['id', 'name'],
        },
        {
          model: categoryModel,
          as: 'parentCategory',
          attributes: ['id', 'name'],
        },
        {
          model: categoryModel,
          as: 'childCategory',
          attributes: ['id', 'name'],
        },
      ],
    });
    return result;
  }

  /** 创建直播回放 */
  async create(data: any) {
    const result = await liveRoomRecordingModel.create(data);
    return result;
  }

  /** 更新直播回放 */
  async update({
    id,
    title,
    url,
  }: {
    id: number;
    title?: string;
    url?: string;
  }) {
    const updateData: any = deleteUseLessObjectKey({ title, url });

    const result = await liveRoomRecordingModel.update(updateData, {
      where: { id },
      limit: 1,
    });

    return result;
  }

  /** 软删除直播回放 */
  async softDelete(id: number) {
    const result = await liveRoomRecordingModel.update(
      { deleted_at: new Date() },
      { where: { id }, limit: 1 }
    );
    return result;
  }

  /** 硬删除直播回放 */
  async delete(id: number) {
    const result = await liveRoomRecordingModel.destroy({
      where: { id },
      limit: 1,
      individualHooks: true,
    });
    return result;
  }
}

export default new LiveRoomRecordingService();
