import sequelize from '@/config/mysql';
import categoriesModel from '@/model/categories.model';
import liveRoomModel from '@/model/liveRoom.model';
import userModel from '@/model/user.model';
import userLiveRoomModel from '@/model/userLiveRoom.model';
import userLiveViewsModel, { ILiveView } from '@/model/user_live_views.model';
import {
  handleKeyWord,
  handleOrder,
  handlePage,
  handlePaging,
  handleRangTime,
} from '@/utils';
import { deleteUseLessObjectKey } from 'billd-utils';
import { Op } from 'sequelize';

class UserLiveViewsService {
  /** 判断观看记录是否存在 */
  async isExist(ids: number[]) {
    const res = await userLiveViewsModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  /** 获取用户观看直播记录列表 */
  // async getList({
  //     id,
  //     user_id,
  //     live_room_id,
  //     orderBy,
  //     orderName,
  //     nowPage,
  //     pageSize,
  //     keyWord,
  //     rangTimeType,
  //     rangTimeStart,
  //     rangTimeEnd,
  // }: any) {
  //     const { offset, limit } = handlePage({ nowPage, pageSize });

  //     const allWhere: any = deleteUseLessObjectKey({
  //         id,
  //         user_id,
  //         live_room_id,
  //     });

  //     const keyWordWhere = handleKeyWord({
  //         keyWord,
  //         arr: ["id"],
  //     });

  //     if (keyWordWhere) {
  //         allWhere[Op.or] = keyWordWhere;
  //     }

  //     const rangTimeWhere = handleRangTime({
  //         rangTimeType,
  //         rangTimeStart,
  //         rangTimeEnd,
  //     });

  //     if (rangTimeWhere) {
  //         allWhere[rangTimeType!] = rangTimeWhere;
  //     }

  //     const orderRes = handleOrder({ orderName, orderBy });

  //     const result = await userLiveViewsModel.findAndCountAll({
  //         order: [...orderRes],
  //         limit,
  //         offset,
  //         where: {
  //             ...allWhere,
  //         },
  //         include: [
  //             {
  //                 model: userModel,
  //                 as: "user",
  //                 attributes: ["id", "username", "avatar"],
  //             },
  //             {
  //                 model: liveRoomModel,
  //                 as: "liveRoom",
  //                 attributes: ["id", "name", "cover_img"],
  //             },
  //         ],
  //         distinct: true,
  //     });

  //     return handlePaging(result, nowPage, pageSize);
  // }
  // async getList({
  //     id,
  //     user_id,
  //     live_room_id,
  //     orderBy,
  //     orderName,
  //     nowPage,
  //     pageSize,
  //     keyWord,
  //     rangTimeType,
  //     rangTimeStart,
  //     rangTimeEnd,
  // }: any) {
  //     const { offset, limit } = handlePage({ nowPage, pageSize });

  //     const allWhere: any = deleteUseLessObjectKey({
  //         id,
  //         user_id,
  //         live_room_id,
  //     });

  //     const keyWordWhere = handleKeyWord({
  //         keyWord,
  //         arr: ["id"],
  //     });

  //     if (keyWordWhere) {
  //         allWhere[Op.or] = keyWordWhere;
  //     }

  //     const rangTimeWhere = handleRangTime({
  //         rangTimeType,
  //         rangTimeStart,
  //         rangTimeEnd,
  //     });

  //     if (rangTimeWhere) {
  //         allWhere[rangTimeType!] = rangTimeWhere;
  //     }

  //     // 处理排序
  //     const orderRes = handleOrder({ orderName, orderBy });
  //     if (!orderRes.length) {
  //         orderRes.push(["watched_at", "DESC"]); // 默认按 watched_at 倒序排列
  //     }

  //     // ** 1. 先从 userLiveViewsModel 获取观看记录，去重保留 watched_at 最新的 **
  //     const subQuery = `(SELECT MAX(watched_at) FROM user_live_views AS sub WHERE sub.user_id = user_live_views.user_id AND sub.live_room_id = user_live_views.live_room_id)`;

  //     const result = await userLiveViewsModel.findAndCountAll({
  //         attributes: [
  //             "id",
  //             "user_id",
  //             "live_room_id",
  //             "watched_at",
  //             "duration",
  //             [
  //                 sequelize.literal(`(${subQuery})`), // 取最新 watched_at 记录
  //                 "latest_watched_at",
  //             ],
  //         ],
  //         where: {
  //             ...allWhere,
  //             watched_at: {
  //                 [Op.eq]: sequelize.literal(`(${subQuery})`),
  //             },
  //         },
  //         order: [...orderRes],
  //         limit,
  //         offset,
  //         include: [
  //             {
  //                 model: userModel,
  //                 as: "user",
  //                 attributes: ["id", "username", "avatar"],
  //             },
  //             {
  //                 model: liveRoomModel,
  //                 as: "liveRoom",
  //                 attributes: ["id", "name", "cover_img"],
  //                 include: [
  //                     {
  //                         model: userLiveRoomModel,
  //                         // as: "liveRoomUsers",
  //                         attributes: ["user_id"],
  //                         include: [
  //                             {
  //                                 model: userModel,
  //                                 // as: "roomOwner",
  //                                 attributes: ["id", "username", "avatar"],
  //                             },
  //                         ],
  //                     },
  //                 ],
  //             },
  //         ],
  //         distinct: true,
  //     });

  //     return handlePaging(result, nowPage, pageSize);
  // }
  async getList({
    id,
    user_id,
    live_room_id,
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: any) {
    const { offset, limit } = handlePage({ nowPage, pageSize });

    const allWhere: any = deleteUseLessObjectKey({
      id,
      user_id,
      live_room_id,
    });

    const keyWordWhere = handleKeyWord({
      keyWord,
      arr: ['id'],
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

    // 处理排序
    const orderRes = handleOrder({ orderName, orderBy });
    if (!orderRes.length) {
      orderRes.push(['watched_at', 'DESC']); // 默认按 watched_at 倒序排列
    }

    // ** 1. 先从 userLiveViewsModel 获取观看记录，去重保留 watched_at 最新的 **
    const subQuery = `(SELECT MAX(watched_at) FROM user_live_views AS sub WHERE sub.user_id = user_live_views.user_id AND sub.live_room_id = user_live_views.live_room_id)`;

    const result = await userLiveViewsModel.findAndCountAll({
      attributes: [
        'id',
        'user_id',
        'live_room_id',
        'watched_at',
        'duration',
        [
          sequelize.literal(`(${subQuery})`), // 取最新 watched_at 记录
          'latest_watched_at',
        ],
      ],
      where: {
        ...allWhere,
        watched_at: {
          [Op.eq]: sequelize.literal(`(${subQuery})`),
        },
      },
      order: [...orderRes],
      limit,
      offset,
      include: [
        {
          model: userModel,
          as: 'user',
          attributes: ['id', 'username', 'avatar'],
        },
        {
          model: liveRoomModel,
          as: 'liveRoom',
          attributes: [
            'id',
            'name',
            'cover_img',
            'parent_category_id',
            'child_category_id',
          ],
          include: [
            {
              model: userLiveRoomModel,
              attributes: ['user_id'],
              include: [
                {
                  model: userModel,
                  attributes: ['id', 'username', 'avatar'],
                },
              ],
            },
            {
              model: categoriesModel,
              as: 'parentCategory',
              attributes: ['id', 'name'],
            },
            {
              model: categoriesModel,
              as: 'childCategory',
              attributes: ['id', 'name'],
            },
          ],
        },
      ],
      distinct: true,
    });

    return handlePaging(result, nowPage, pageSize);
  }

  /** 查询某个观看直播记录 */
  async find(id: number) {
    const result = await userLiveViewsModel.findOne({
      where: { id },
      include: [
        {
          model: userModel,
          as: 'user',
          attributes: ['id', 'username', 'avatar'],
        },
        {
          model: liveRoomModel,
          as: 'liveRoom',
          attributes: ['id', 'name', 'cover_img'],
        },
      ],
    });

    return result;
  }

  /** 创建用户观看直播记录 */
  async create(data: ILiveView) {
    const result = await userLiveViewsModel.create(data);
    return result;
  }

  /** 更新用户观看直播记录（更新观看时长） */
  async update({ id, duration }: ILiveView) {
    const result = await userLiveViewsModel.update(
      { duration },
      { where: { id }, limit: 1 }
    );
    return result;
  }

  /** 软删除观看直播记录 */
  async softDelete(id: number) {
    const result = await userLiveViewsModel.update(
      { deleted_at: new Date() },
      { where: { id }, limit: 1 }
    );
    return result;
  }

  /** 硬删除观看直播记录 */
  async delete(id: number) {
    const result = await userLiveViewsModel.destroy({
      where: { id },
      limit: 1,
      individualHooks: true,
    });
    return result;
  }
  /** 根据 user_id 和 video_id 删除所有匹配的观看记录 */
  async deleteByUserAndVideo(user_id: number, live_room_id: number) {
    const deletedCount = await userLiveViewsModel.destroy({
      where: { user_id, live_room_id },
      individualHooks: true, // 触发 hooks（如果有）
    });
    return deletedCount;
  }
  /** 根据 user_id 删除该用户的所有观看记录 */
  async deleteByUser(user_id: number) {
    const deletedCount = await userLiveViewsModel.destroy({
      where: { user_id },
      individualHooks: true, // 触发 hooks（如果有）
    });
    return deletedCount;
  }

  /** 根据 video_id 删除该视频的所有观看记录 */
  async deleteByVideo(live_room_id: number) {
    const deletedCount = await userLiveViewsModel.destroy({
      where: { live_room_id },
      individualHooks: true,
    });
    return deletedCount;
  }
}

export default new UserLiveViewsService();
