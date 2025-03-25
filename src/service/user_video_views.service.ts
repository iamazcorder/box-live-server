import sequelize from '@/config/mysql';
import userModel from '@/model/user.model';
import userVideosModel from '@/model/user_videos.model';
import userVideoViewsModel, {
  IVideoView,
} from '@/model/user_video_views.model';
import {
  handleKeyWord,
  handlePage,
  handlePaging,
  handleRangTime,
} from '@/utils';
import { deleteUseLessObjectKey } from 'billd-utils';
import { Op } from 'sequelize';

class UserVideoViewsService {
  /** 判断观看记录是否存在 */
  async isExist(ids: number[]) {
    const res = await userVideoViewsModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  /** 获取用户观看记录列表 */
  // async getList({
  //     id,
  //     user_id,
  //     video_id,
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
  //         video_id,
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

  //     const result = await userVideoViewsModel.findAndCountAll({
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
  //                 model: userVideosModel,
  //                 as: "video",
  //                 attributes: ["id", "title", "cover", "url", "duration"],
  //             },
  //         ],
  //         distinct: true,
  //     });

  //     return handlePaging(result, nowPage, pageSize);
  // }
  async getList({
    id,
    user_id,
    video_id,
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
      video_id,
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

    const result = await userVideoViewsModel.findAndCountAll({
      order: [[sequelize.literal('watched_at'), 'DESC']], // 按 watched_at 降序排列
      limit,
      offset,
      where: {
        ...allWhere,
        watched_at: {
          [Op.eq]: sequelize.literal(`(
                        SELECT MAX(watched_at) FROM user_video_views AS uv 
                        WHERE uv.video_id = user_video_views.video_id
                        ${user_id ? `AND uv.user_id = ${user_id}` : ''}
                    )`),
        },
      },
      include: [
        {
          model: userModel,
          as: 'user',
          attributes: ['id', 'username', 'avatar'],
        },
        {
          model: userVideosModel,
          as: 'video',
          attributes: ['id', 'title', 'cover', 'url', 'duration', 'user_id'], // 需要包含 `user_id`
          include: [
            {
              model: userModel,
              as: 'user', // 这里的 `as` 需要和你在 `model` 里定义的别名一致
              attributes: ['id', 'username', 'avatar'],
            },
          ],
        },
      ],
      distinct: true,
    });

    return handlePaging(result, nowPage, pageSize);
  }

  /** 查询某个观看记录 */
  async find(id: number) {
    const result = await userVideoViewsModel.findOne({
      where: { id },
      include: [
        {
          model: userModel,
          as: 'user',
          attributes: ['id', 'username', 'avatar'],
        },
        {
          model: userVideosModel,
          as: 'video',
          attributes: ['id', 'title', 'cover', 'url', 'duration'],
        },
      ],
    });

    return result;
  }

  /** 创建用户观看记录 */
  async create(data: IVideoView) {
    const result = await userVideoViewsModel.create(data);
    return result;
  }

  /** 更新用户观看记录（更新观看时长、是否看完） */
  async update({ id, duration, is_finished }: IVideoView) {
    const result = await userVideoViewsModel.update(
      { duration, is_finished },
      { where: { id }, limit: 1 }
    );
    return result;
  }

  /** 软删除观看记录 */
  async softDelete(id: number) {
    const result = await userVideoViewsModel.update(
      { deleted_at: new Date() },
      { where: { id }, limit: 1 }
    );
    return result;
  }

  /** 硬删除观看记录 */
  async delete(id: number) {
    const result = await userVideoViewsModel.destroy({
      where: { id },
      limit: 1,
      individualHooks: true,
    });
    return result;
  }
  /** 根据 user_id 和 video_id 删除所有匹配的观看记录 */
  async deleteByUserAndVideo(user_id: number, video_id: number) {
    const deletedCount = await userVideoViewsModel.destroy({
      where: { user_id, video_id },
      individualHooks: true, // 触发 hooks（如果有）
    });
    return deletedCount;
  }
  /** 根据 user_id 删除该用户的所有观看记录 */
  async deleteByUser(user_id: number) {
    const deletedCount = await userVideoViewsModel.destroy({
      where: { user_id },
      individualHooks: true, // 触发 hooks（如果有）
    });
    return deletedCount;
  }

  /** 根据 video_id 删除该视频的所有观看记录 */
  async deleteByVideo(video_id: number) {
    const deletedCount = await userVideoViewsModel.destroy({
      where: { video_id },
      individualHooks: true,
    });
    return deletedCount;
  }
}

export default new UserVideoViewsService();
