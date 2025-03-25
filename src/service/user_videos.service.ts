import sequelize from '@/config/mysql';
import categoriesModel from '@/model/categories.model';
import liveRoomModel from '@/model/liveRoom.model';
import userModel from '@/model/user.model';
import userVideosModel, { IVideo } from '@/model/user_videos.model';
import {
  handleKeyWord,
  handleOrder,
  handlePage,
  handlePaging,
  handleRangTime,
} from '@/utils';
import { deleteUseLessObjectKey } from 'billd-utils';
import { Op } from 'sequelize';

class UserVideosService {
  /** 判断视频是否存在 */
  async isExist(ids: number[]) {
    const res = await userVideosModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  /** 获取用户视频列表 */
  // async getList({
  //     id,
  //     user_id,
  //     live_room_id,
  //     parent_category_id,
  //     child_category_id,
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
  //         parent_category_id,
  //         child_category_id,
  //     });

  //     const keyWordWhere = handleKeyWord({
  //         keyWord,
  //         arr: ["title"],
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

  //     const result = await userVideosModel.findAndCountAll({
  //         order: [...orderRes],
  //         limit,
  //         offset,
  //         where: {
  //             ...allWhere,
  //         },
  //         include: [
  //             {
  //                 model: userModel,
  //                 as: 'user',
  //                 attributes: ["id", "username", "avatar"],
  //             },
  //             {
  //                 model: liveRoomModel,
  //                 as: 'liveRoom',
  //                 attributes: ["id", "name"],
  //             },
  //             {
  //                 model: categoriesModel,
  //                 as: "parentCategory",
  //                 attributes: ["id", "name"],
  //             },
  //             {
  //                 model: categoriesModel,
  //                 as: "childCategory",
  //                 attributes: ["id", "name"],
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
  }: any) {
    const { offset, limit } = handlePage({ nowPage, pageSize });

    const allWhere: any = deleteUseLessObjectKey({
      id,
      user_id,
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

    // **计算观看次数**
    const viewsCountQuery = `(SELECT COUNT(*) FROM user_video_views AS views WHERE views.video_id = user_videos.id)`;

    // **计算发布用户的粉丝数**
    const followersCountQuery = `(SELECT COUNT(*) FROM user_follows WHERE user_follows.following_id = user_videos.user_id)`;

    // **计算综合排序得分（rank_score）**
    const rankScoreQuery = `
    (
        LOG(GREATEST(${viewsCountQuery}, 1)) * 5 + 
        LOG(GREATEST(${followersCountQuery}, 1)) * 3
    )`;
    // **排序逻辑**
    let orderRes: any = [];
    if (orderBy === 'mostPlay') {
      orderRes = [[sequelize.literal(`(${viewsCountQuery})`), 'DESC']]; // 按观看次数降序
    } else if (orderBy === 'newPublish') {
      orderRes = [['created_at', 'DESC']]; // 按发布时间降序
    } else {
      // **综合排序**
      orderRes = [[sequelize.literal(`(${rankScoreQuery})`), 'DESC']];
    }

    // const orderRes = handleOrder({ orderName, orderBy });

    const result = await userVideosModel.findAndCountAll({
      order: [...orderRes],
      limit,
      offset,
      where: {
        ...allWhere,
      },
      attributes: {
        include: [
          // 计算每个视频的观看次数
          [sequelize.literal(viewsCountQuery), 'views_count'],
        ],
      },
      include: [
        {
          model: userModel,
          as: 'user',
          attributes: ['id', 'username', 'avatar'],
        },
        {
          model: liveRoomModel,
          as: 'liveRoom',
          attributes: ['id', 'name'],
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
      group: ['user_videos.id'],
      distinct: true,
    });

    return handlePaging(result, nowPage, pageSize);
  }

  /** 根据 ID 查找单个视频 */
  async find(id: number) {
    const result = await userVideosModel.findOne({
      where: { id },
      attributes: {
        include: [
          // 计算每个视频的观看次数
          [
            sequelize.literal(`(
                            SELECT COUNT(*) FROM user_video_views AS views
                            WHERE views.video_id = user_videos.id
                        )`),
            'views_count',
          ],
        ],
      },
      include: [
        {
          model: userModel,
          as: 'user',
          attributes: ['id', 'username', 'avatar', 'desc'],
        },
        {
          model: liveRoomModel,
          as: 'liveRoom',
          attributes: ['id', 'name'],
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
    });

    return result;
  }

  /** 创建用户视频 */
  async create(data: IVideo) {
    const result = await userVideosModel.create(data);
    return result;
  }

  /** 更新用户视频 */
  async update({
    id,
    title,
    cover,
    url,
    desc,
    parent_category_id,
    child_category_id,
  }: IVideo) {
    const result = await userVideosModel.update(
      { title, cover, url, desc, parent_category_id, child_category_id },
      { where: { id }, limit: 1 }
    );
    return result;
  }

  /** 软删除用户视频 */
  async softDelete(id: number) {
    const result = await userVideosModel.update(
      { deleted_at: new Date() },
      { where: { id }, limit: 1 }
    );
    return result;
  }

  /** 硬删除用户视频 */
  async delete(id: number) {
    const result = await userVideosModel.destroy({
      where: { id },
      limit: 1,
      individualHooks: true,
    });
    return result;
  }
}

export default new UserVideosService();
