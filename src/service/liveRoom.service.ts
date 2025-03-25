import { deleteUseLessObjectKey, filterObj, isPureNumber } from 'billd-utils';
import { Op } from 'sequelize';

import sequelize from '@/config/mysql';
import { LIVE_ROOM_MODEL_EXCLUDE } from '@/constant';
import { IList } from '@/interface';
import areaModel from '@/model/area.model';
import categoriesModel from '@/model/categories.model';
import liveModel from '@/model/live.model';
import liveRoomModel from '@/model/liveRoom.model';
import userModel from '@/model/user.model';
import userLiveRoomModel from '@/model/userLiveRoom.model';
import { ILiveRoom } from '@/types/ILiveRoom';
import {
  handleKeyWord,
  handleOrder,
  handlePage,
  handlePaging,
  handleRangTime,
} from '@/utils';

class LiveRoomService {
  /** 直播间是否存在 */
  async isExist(ids: number[]) {
    const res = await liveRoomModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  /** 获取直播间列表 */
  async getList({
    id,
    status,
    is_show,
    is_fake,
    type,
    cdn,
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<ILiveRoom>) {
    const { offset, limit } = handlePage({ nowPage, pageSize });
    const allWhere: any = deleteUseLessObjectKey({
      id,
      status,
      is_show,
      is_fake,
    });
    if (type !== undefined && isPureNumber(`${type}`)) {
      allWhere.type = type;
    }
    if (cdn !== undefined && isPureNumber(`${cdn}`)) {
      allWhere.cdn = cdn;
    }
    const keyWordWhere = handleKeyWord({
      keyWord,
      arr: ['name'],
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
    const result = await liveRoomModel.findAndCountAll({
      include: [
        {
          model: userModel,
          attributes: {
            exclude: ['password', 'token'],
          },
          through: { attributes: [] },
        },
        {
          model: liveModel,
        },
        {
          model: areaModel,
          through: { attributes: [] },
        },
      ],
      attributes: {
        exclude: LIVE_ROOM_MODEL_EXCLUDE,
        include: [
          // 计算每个视频的观看次数
          [
            sequelize.literal(`(
                      SELECT COUNT(DISTINCT views.user_id) FROM user_live_views AS views
                      WHERE views.live_room_id = live_room.id
                  )`),
            'views_count',
          ],
        ],
      },
      distinct: true,
      order: [...orderRes],
      limit,
      offset,
      where: {
        ...allWhere,
      },
    });
    return handlePaging(result, nowPage, pageSize);
  }

  /** 获取正在直播的直播间列表 */
  async getLiveRooms({
    parent_category_id,
    child_category_id,
    nowPage,
    pageSize,
    orderBy,
    orderName,
    keyWord,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<ILiveRoom>) {
    const { offset, limit } = handlePage({ nowPage, pageSize });

    const allWhere: any = deleteUseLessObjectKey({
      parent_category_id,
      child_category_id,
    });

    // 处理关键字搜索（直播间名称/描述）
    const keyWordWhere = handleKeyWord({
      keyWord,
      arr: ['name', 'desc', 'remark'],
    });
    if (keyWordWhere) {
      allWhere[Op.or] = keyWordWhere;
    }

    // 处理时间范围筛选
    const rangTimeWhere = handleRangTime({
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    });
    if (rangTimeWhere) {
      allWhere[rangTimeType!] = rangTimeWhere;
    }

    // 处理排序规则（默认按创建时间降序）
    const orderRes = handleOrder({ orderName, orderBy });
    if (!orderRes.length) {
      orderRes.push(['created_at', 'DESC']);
    }

    const result = await liveRoomModel.findAndCountAll({
      include: [
        {
          model: userModel,
          attributes: { exclude: ['password', 'token'] },
          through: { attributes: [] },
        },
        {
          model: liveModel,
          required: true, // **确保只获取正在直播的直播间**
          attributes: ['id', 'live_room_id'],
        },
        {
          model: areaModel,
          through: { attributes: [] },
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
      attributes: {
        exclude: LIVE_ROOM_MODEL_EXCLUDE,
      },
      distinct: true,
      order: [...orderRes],
      limit,
      offset,
      where: allWhere,
    });

    return handlePaging(result, nowPage, pageSize);
  }

  /** 获取不在直播的直播间列表 */
  async getNotLiveRooms({
    parent_category_id,
    child_category_id,
    nowPage,
    pageSize,
    orderBy,
    orderName,
    keyWord,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<ILiveRoom>) {
    const { offset, limit } = handlePage({ nowPage, pageSize });

    const allWhere: any = deleteUseLessObjectKey({
      parent_category_id,
      child_category_id,
    });

    // 处理关键字搜索（直播间名称/描述）
    const keyWordWhere = handleKeyWord({
      keyWord,
      arr: ['name', 'desc', 'remark'],
    });
    if (keyWordWhere) {
      allWhere[Op.or] = keyWordWhere;
    }

    // 处理时间范围筛选
    const rangTimeWhere = handleRangTime({
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    });
    if (rangTimeWhere) {
      allWhere[rangTimeType!] = rangTimeWhere;
    }

    // 处理排序规则（默认按创建时间降序）
    const orderRes = handleOrder({ orderName, orderBy });
    if (!orderRes.length) {
      orderRes.push(['created_at', 'DESC']);
    }

    const result = await liveRoomModel.findAndCountAll({
      include: [
        {
          model: userModel,
          attributes: { exclude: ['password', 'token'] },
          through: { attributes: [] },
        },
        {
          model: liveModel,
          required: false, // **注意：这里改成 `false`，确保获取不到正在直播的直播间**
          attributes: ['id', 'live_room_id'],
          where: { id: null }, // **确保 `live` 表中找不到数据**
        },
        {
          model: areaModel,
          through: { attributes: [] },
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
      attributes: {
        exclude: LIVE_ROOM_MODEL_EXCLUDE,
      },
      distinct: true,
      order: [...orderRes],
      limit,
      offset,
      where: allWhere,
    });

    return handlePaging(result, nowPage, pageSize);
  }

  async getAllLiveRooms({
    parent_category_id,
    child_category_id,
    nowPage,
    pageSize,
    orderBy,
    orderName,
    keyWord,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<ILiveRoom>) {
    const { offset, limit } = handlePage({ nowPage, pageSize });

    const allWhere: any = deleteUseLessObjectKey({
      parent_category_id,
      child_category_id,
    });

    // 处理关键字搜索（直播间名称/描述）
    const keyWordWhere = handleKeyWord({
      keyWord,
      arr: ['name'],
    });
    if (keyWordWhere) {
      allWhere[Op.or] = keyWordWhere;
    }

    // 处理时间范围筛选
    const rangTimeWhere = handleRangTime({
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    });
    if (rangTimeWhere) {
      allWhere[rangTimeType!] = rangTimeWhere;
    }

    // **正确计算 is_live（是否在直播）**
    const isLiveQuery = `
    SELECT COUNT(*) FROM live WHERE live.live_room_id = live_room.id AND live.deleted_at IS NULL
  `;

    // **计算观看人数**
    const viewsCountQuery = `(SELECT COUNT(DISTINCT views.user_id) FROM user_live_views AS views WHERE views.live_room_id = live_room.id)`;

    // **计算点赞数**
    const likesCountQuery = `(SELECT COUNT(*) FROM ws_message WHERE ws_message.live_room_id = live_room.id AND ws_message.msg_type = 6 AND ws_message.deleted_at IS NULL)`;

    // **计算评论数**
    const commentsCountQuery = `(SELECT COUNT(*) FROM ws_message WHERE ws_message.live_room_id = live_room.id AND ws_message.msg_type = 0 AND ws_message.deleted_at IS NULL)`;

    // **计算主播粉丝数**
    const followersCountQuery = `(SELECT COUNT(*) 
    FROM user_follows 
    WHERE user_follows.following_id = (
        SELECT user_live_room.user_id 
        FROM user_live_room 
        WHERE user_live_room.live_room_id = live_room.id 
        LIMIT 1
    )
    AND user_follows.deleted_at IS NULL)`;

    // **计算获得礼物数**
    const giftCountQuery = `(SELECT COUNT(*) FROM ws_message WHERE ws_message.live_room_id = live_room.id AND ws_message.msg_type = 5 AND ws_message.deleted_at IS NULL)`;

    // **计算获得礼物金额**
    const giftAmountQuery = `
    (SELECT COALESCE(SUM(goods.price), 0)
     FROM ws_message
     JOIN goods ON ws_message.content = goods.name
     WHERE ws_message.live_room_id = live_room.id
       AND ws_message.msg_type = 5
       AND ws_message.deleted_at IS NULL)`;

    // **获取最新开播时间（live_record 表的 start_time）**
    const latestStartTimeQuery = `
  (SELECT MAX(start_time) FROM live_record 
   WHERE live_record.live_room_id = live_room.id 
     AND live_record.deleted_at IS NULL)`;

    // **计算综合排序得分（rank_score）**
    const rankScoreQuery = `
    (
      LOG(GREATEST(${viewsCountQuery}, 1)) * 6 + 
      LOG(GREATEST(${likesCountQuery}, 1)) * 3 + 
      LOG(GREATEST(${commentsCountQuery}, 1)) * 2 + 
      LOG(GREATEST(${giftCountQuery}, 1)) * 4 +
      LOG(GREATEST(${giftAmountQuery}, 1)) * 5 + 
      LOG(GREATEST(${followersCountQuery}, 1)) * 1 + 
      COALESCE((CURRENT_TIMESTAMP - COALESCE(${latestStartTimeQuery}, NOW())) / 3600 * -0.1, 0) +
      (CASE WHEN (${isLiveQuery}) > 0 THEN 1000 ELSE 0 END)
    )`;
    // const orderRes = handleOrder({ orderName, orderBy });
    // if (!orderRes.length) {
    //   orderRes.push([sequelize.literal(`(${isLiveQuery})`), "DESC"]); // **按 is_live 排序**
    //   orderRes.push(["created_at", "DESC"]); // **然后按照创建时间排序**
    // }

    let orderRes: any = [];
    if (orderBy === 'newLive') {
      // **按最新开播时间排序**
      orderRes = [[sequelize.literal(`(${latestStartTimeQuery})`), 'DESC']];
    } else {
      // **综合排序**
      orderRes = [
        [sequelize.literal(`(${isLiveQuery})`), 'DESC'], // **正在直播的排在前面**
        [sequelize.literal(`(${rankScoreQuery})`), 'DESC'], // **按照 `rank_score` 排序**
        [sequelize.literal(`(${latestStartTimeQuery})`), 'DESC'], // **其次按最新开播**
      ];
    }

    const result = await liveRoomModel.findAndCountAll({
      include: [
        {
          model: userModel,
          attributes: { exclude: ['password', 'token'] },
          through: { attributes: [] },
        },
        {
          model: areaModel,
          through: { attributes: [] },
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
      attributes: {
        exclude: LIVE_ROOM_MODEL_EXCLUDE,
        include: [
          [sequelize.literal(`(${isLiveQuery})`), 'is_live'], // **添加 is_live 字段**
          [sequelize.literal(viewsCountQuery), 'views_count'],
          [sequelize.literal(`(${likesCountQuery})`), 'likes_count'], // 点赞数
          [sequelize.literal(`(${commentsCountQuery})`), 'comments_count'], // 评论数
          [sequelize.literal(`(${giftCountQuery})`), 'gift_count'], // 礼物数
          [sequelize.literal(`(${giftAmountQuery})`), 'gift_amount'], // 礼物金额
          [sequelize.literal(`(${followersCountQuery})`), 'followers_count'], // 主播粉丝数
          [sequelize.literal(`(${rankScoreQuery})`), 'rank_score'], // 综合排序分数
          [sequelize.literal(`(${latestStartTimeQuery})`), 'latest_start_time'], // 最新开播时间
        ],
      },
      distinct: true,
      order: orderRes,
      limit,
      offset,
      where: allWhere,
    });

    return handlePaging(result, nowPage, pageSize);
  }

  /** 获取直播间的用户排行榜 */
  async getUserRankingsForLiveRoom({
    live_room_id,
    nowPage,
    pageSize,
    orderBy,
    orderName,
    rankType, // "all-time" | "daily" | "weekly" | "monthly"
  }: any) {
    if (!live_room_id) {
      throw new Error('live_room_id 参数不能为空');
    }

    const { offset, limit } = handlePage({ nowPage, pageSize });

    // **时间范围筛选**
    let wsTimeFilterCondition = '';
    if (rankType === 'daily') {
      wsTimeFilterCondition = 'AND ws_message.created_at >= CURDATE()'; // 只筛选今天的数据
    } else if (rankType === 'weekly') {
      wsTimeFilterCondition =
        'AND ws_message.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)'; // 7 天内数据
    } else if (rankType === 'monthly') {
      wsTimeFilterCondition =
        'AND ws_message.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)'; // 30 天内数据
    }

    let timeFilterCondition = '';
    if (rankType === 'daily') {
      timeFilterCondition = 'AND user_live_views.created_at >= CURDATE()'; // 只统计当天数据
    } else if (rankType === 'weekly') {
      timeFilterCondition =
        'AND user_live_views.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)'; // 过去 7 天数据
    } else if (rankType === 'monthly') {
      timeFilterCondition =
        'AND user_live_views.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)'; // 过去 30 天数据
    }

    // **计算用户送礼个数**
    const giftCountQuery = `
        (SELECT COUNT(*) FROM ws_message
         WHERE ws_message.live_room_id = ${live_room_id}
         AND ws_message.user_id = user.id
         AND ws_message.msg_type = 5
         AND ws_message.deleted_at IS NULL ${wsTimeFilterCondition})`;

    // **计算用户送礼总金额**
    const giftAmountQuery = `
        (SELECT COALESCE(SUM(goods.price), 0) FROM ws_message
         JOIN goods ON ws_message.content = goods.name
         WHERE ws_message.live_room_id = ${live_room_id}
         AND ws_message.user_id = user.id
         AND ws_message.msg_type = 5
         AND ws_message.deleted_at IS NULL ${wsTimeFilterCondition})`;

    // **计算用户在该直播间的点赞数**
    const likesCountQuery = `
        (SELECT COUNT(*) FROM ws_message
         WHERE ws_message.live_room_id = ${live_room_id}
         AND ws_message.user_id = user.id
         AND ws_message.msg_type = 6
         AND ws_message.deleted_at IS NULL ${wsTimeFilterCondition})`;

    // **计算用户在该直播间的评论数**
    const commentsCountQuery = `
        (SELECT COUNT(*) FROM ws_message
         WHERE ws_message.live_room_id = ${live_room_id}
         AND ws_message.user_id = user.id
         AND ws_message.msg_type = 0
         AND ws_message.deleted_at IS NULL ${wsTimeFilterCondition})`;

    // **计算用户的总观看时长**
    const watchDurationQuery = `
        (SELECT COALESCE(SUM(user_live_views.duration), 0)
         FROM user_live_views
         WHERE user_live_views.live_room_id = ${live_room_id}
         AND user_live_views.user_id = user.id) ${timeFilterCondition}`;

    // **贡献值计算（返回整数）**
    const contributionScoreQuery = `
    FLOOR(
      (
        (${likesCountQuery} / 30) +   -- 30 次点赞 = 1 贡献值
        (${commentsCountQuery} / 10) +   -- 10 条弹幕 = 1 贡献值
        (${watchDurationQuery} / 900) +   -- 900 秒（15 分钟） = 1 贡献值
        (${giftAmountQuery} / 100)   -- 100 分（1 元）= 1 贡献值
      )
    )`;

    // **排序规则**
    let orderRes: any = [];
    if (orderBy === 'giftCount') {
      orderRes = [[sequelize.literal(`(${giftCountQuery})`), 'DESC']]; // 按送礼个数排序
    } else if (orderBy === 'giftAmount') {
      orderRes = [[sequelize.literal(`(${giftAmountQuery})`), 'DESC']]; // 按送礼金额排序
    } else if (orderBy === 'likes') {
      orderRes = [[sequelize.literal(`(${likesCountQuery})`), 'DESC']]; // 按点赞数排序
    } else if (orderBy === 'comments') {
      orderRes = [[sequelize.literal(`(${commentsCountQuery})`), 'DESC']]; // 按评论数排序
    } else if (orderBy === 'watchDuration') {
      orderRes = [[sequelize.literal(`(${watchDurationQuery})`), 'DESC']]; // 按观看时长排序
    } else {
      orderRes = [[sequelize.literal(`(${contributionScoreQuery})`), 'DESC']]; // 贡献值
    }

    const result = await userModel.findAndCountAll({
      attributes: {
        exclude: ['password', 'token'],
        include: [
          [sequelize.literal(`(${giftCountQuery})`), 'gift_count'], // 送礼个数
          [sequelize.literal(`(${giftAmountQuery})`), 'gift_amount'], // 送礼总金额
          [sequelize.literal(`(${likesCountQuery})`), 'likes_count'], // 点赞数
          [sequelize.literal(`(${commentsCountQuery})`), 'comments_count'], // 评论数
          [sequelize.literal(`(${watchDurationQuery})`), 'watch_duration'], // 观看时长
          [
            sequelize.literal(`(${contributionScoreQuery})`),
            'contribute_score',
          ], // 贡献值
        ],
      },
      order: orderRes,
      limit,
      offset,
      where: {
        id: {
          [Op.in]: sequelize.literal(
            `(SELECT DISTINCT user_id FROM user_live_views WHERE live_room_id = ${live_room_id})`
          ),
        },
      },
      distinct: true,
    });

    return handlePaging(result, nowPage, pageSize);
  }
  // async getUserRankingsForLiveRoom({
  //   live_room_id,
  //   nowPage,
  //   pageSize,
  //   orderBy,
  //   orderName,
  //   rankType,  // "all-time" | "daily" | "weekly" | "monthly"
  // }: any) {
  //   const { offset, limit } = handlePage({ nowPage, pageSize });

  //   if (!live_room_id) {
  //     throw new Error("直播间 ID 不能为空！");
  //   }

  //   // **时间范围筛选**
  //   let timeFilterCondition = "";
  //   if (rankType === "daily") {
  //     timeFilterCondition = "AND ws_message.created_at >= CURDATE()"; // 只筛选今天的数据
  //   } else if (rankType === "weekly") {
  //     timeFilterCondition = "AND ws_message.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)"; // 7 天内数据
  //   } else if (rankType === "monthly") {
  //     timeFilterCondition = "AND ws_message.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)"; // 30 天内数据
  //   }

  //   // **统计点赞数**
  //   const likesCountQuery = `
  //       (SELECT COUNT(*) FROM ws_message
  //        WHERE ws_message.live_room_id = ${live_room_id}
  //        AND ws_message.msg_type = 6
  //        AND ws_message.deleted_at IS NULL
  //        ${timeFilterCondition})`;

  //   // **统计弹幕数**
  //   const commentsCountQuery = `
  //       (SELECT COUNT(*) FROM ws_message
  //        WHERE ws_message.live_room_id = ${live_room_id}
  //        AND ws_message.msg_type = 0
  //        AND ws_message.deleted_at IS NULL
  //        ${timeFilterCondition})`;

  //   // **统计观看时长**
  //   const watchDurationQuery = `
  //       (SELECT COALESCE(SUM(views.duration), 0) FROM user_live_views AS views
  //        WHERE views.live_room_id = ${live_room_id}
  //        AND views.deleted_at IS NULL
  //        ${timeFilterCondition})`;

  //   // **统计礼物个数**
  //   const giftCountQuery = `
  //       (SELECT COUNT(*) FROM ws_message
  //        WHERE ws_message.live_room_id = ${live_room_id}
  //        AND ws_message.msg_type = 5
  //        AND ws_message.deleted_at IS NULL
  //        ${timeFilterCondition})`;

  //   // **统计礼物金额（单位：角）**
  //   const giftAmountQuery = `
  //       (SELECT COALESCE(SUM(goods.price), 0) FROM ws_message
  //        JOIN goods ON ws_message.content = goods.name
  //        WHERE ws_message.live_room_id = ${live_room_id}
  //        AND ws_message.msg_type = 5
  //        AND ws_message.deleted_at IS NULL
  //        ${timeFilterCondition})`;

  //   // **计算贡献值（整数）**
  //   const contributionScoreQuery = `
  //       FLOOR(
  //         (
  //           (${likesCountQuery} / 30) +   -- 30 次点赞 = 1 贡献值
  //           (${commentsCountQuery} / 10) +   -- 10 条弹幕 = 1 贡献值
  //           (${watchDurationQuery} / 900) +   -- 900 秒（15 分钟）= 1 贡献值
  //           (${giftAmountQuery} / 100)   -- 100 分（1 元）= 1 贡献值
  //         )
  //       )`;

  //   // **排序规则**
  //   let orderRes: any = [];
  //   if (orderBy === "likes") {
  //     orderRes = [[sequelize.literal(`(${likesCountQuery})`), "DESC"]]; // 按点赞数排序
  //   } else if (orderBy === "gifts") {
  //     orderRes = [[sequelize.literal(`(${giftAmountQuery})`), "DESC"]]; // 按礼物金额排序
  //   } else {
  //     // **默认按贡献值排序**
  //     orderRes = [[sequelize.literal(`(${contributionScoreQuery})`), "DESC"]];
  //   }

  //   // **查询排行榜**
  //   const result = await userModel.findAndCountAll({
  //     attributes: {
  //       exclude: ['password', 'token'],
  //       include: [
  //         [sequelize.literal(`(${likesCountQuery})`), "likes_count"], // 点赞数
  //         [sequelize.literal(`(${commentsCountQuery})`), "comments_count"], // 评论数
  //         [sequelize.literal(`(${watchDurationQuery})`), "watch_duration"], // 观看时长（秒）
  //         [sequelize.literal(`(${giftCountQuery})`), "gift_count"], // 礼物个数
  //         [sequelize.literal(`(${giftAmountQuery})`), "gift_amount"], // 礼物金额（角）
  //         [sequelize.literal(`(${contributionScoreQuery})`), "contribution_score"], // 贡献值
  //       ],
  //     },
  //     where: {
  //       id: {
  //         [Op.in]: sequelize.literal(`
  //                   (SELECT DISTINCT user_id FROM user_live_views
  //                   WHERE live_room_id = ${live_room_id}
  //                   AND deleted_at IS NULL
  //                   ${timeFilterCondition})
  //               `),
  //       },
  //     },
  //     order: orderRes,
  //     limit,
  //     offset,
  //     distinct: true,
  //   });

  //   return handlePaging(result, nowPage, pageSize);
  // }

  /** 获取直播间列表 */
  async getPureList({
    id,
    status,
    is_show,
    is_fake,
    type,
    cdn,
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<ILiveRoom>) {
    const { offset, limit } = handlePage({ nowPage, pageSize });
    const allWhere: any = deleteUseLessObjectKey({
      id,
      status,
      is_show,
      is_fake,
    });
    if (type !== undefined && isPureNumber(`${type}`)) {
      allWhere.type = type;
    }
    if (cdn !== undefined && isPureNumber(`${cdn}`)) {
      allWhere.cdn = cdn;
    }
    const keyWordWhere = handleKeyWord({
      keyWord,
      arr: ['name', 'desc', 'remark'],
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
    const result = await liveRoomModel.findAndCountAll({
      attributes: {
        exclude: LIVE_ROOM_MODEL_EXCLUDE,
      },
      distinct: true,
      order: [...orderRes],
      limit,
      offset,
      where: {
        ...allWhere,
      },
    });
    return handlePaging(result, nowPage, pageSize);
  }

  /** 查找直播间 */
  async find(id: number) {
    const result = await liveRoomModel.findOne({
      include: [
        {
          model: userModel,
          attributes: {
            exclude: ['password', 'token'],
          },
          through: {
            attributes: [],
          },
        },
        {
          model: liveModel,
        },
        {
          model: areaModel,
          through: {
            attributes: [],
          },
        },
      ],
      attributes: {
        exclude: LIVE_ROOM_MODEL_EXCLUDE,
        include: [
          // 计算 user_live_views 表中 live_room_id = id 的唯一 user_id 数量
          [
            sequelize.literal(`(
                      SELECT COUNT(DISTINCT views.user_id) FROM user_live_views AS views
                      WHERE views.live_room_id = live_room.id
                  )`),
            'views_count',
          ],
        ],
      },
      where: { id },
    });
    return result;
  }

  /** 查找直播间 */
  async findPure(id: number) {
    const result = await liveRoomModel.findOne({
      attributes: {
        exclude: LIVE_ROOM_MODEL_EXCLUDE,
      },
      where: { id },
    });
    return result;
  }

  /** 查找直播间 */
  async findByName(name: string) {
    const result = await liveRoomModel.findOne({
      include: [
        {
          model: userLiveRoomModel,
          include: [
            {
              model: userModel,
              attributes: {
                exclude: ['password', 'token'],
              },
            },
          ],
          required: true,
        },
        {
          model: liveModel,
        },
        {
          model: areaModel,
          through: {
            attributes: [],
          },
        },
      ],
      attributes: {
        exclude: LIVE_ROOM_MODEL_EXCLUDE,
      },
      where: { name },
    });
    return result;
  }

  /** 查找直播间key */
  async findKey(id: number) {
    const result = await liveRoomModel.findOne({
      attributes: ['key'],
      where: { id },
    });
    return result;
  }

  /** 查找直播间key */
  async findKey2(id: number) {
    const result = await liveRoomModel.findOne({
      attributes: LIVE_ROOM_MODEL_EXCLUDE,
      where: { id },
      include: [
        {
          model: userModel,
          attributes: {
            exclude: ['password', 'token'],
          },
        },
        {
          model: areaModel,
          through: {
            attributes: [],
          },
        },
      ],
    });
    return result;
  }

  /** 修改直播间 */
  async update(data: ILiveRoom) {
    const { id } = data;
    const data2 = filterObj(data, ['id']);
    const result = await liveRoomModel.update(data2, {
      where: { id },
      limit: 1,
    });
    return result;
  }

  /** 创建直播间 */
  async create(data: ILiveRoom) {
    const result = await liveRoomModel.create(data);
    return result;
  }

  /** 更新直播间封面 */
  async updateCover(id: number, coverUrl: string) {
    const result = await liveRoomModel.update(
      { cover_img: coverUrl },
      { where: { id }, limit: 1 }
    );
    return result;
  }

  /** 删除直播间 */
  async delete(id: number) {
    const result = await liveRoomModel.destroy({
      where: { id },
      limit: 1,
      individualHooks: true,
    });
    return result;
  }
}

export default new LiveRoomService();
