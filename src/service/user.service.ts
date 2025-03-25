import { deleteUseLessObjectKey } from 'billd-utils';
import { literal, Op, where } from 'sequelize';

import sequelize from '@/config/mysql';
import {
  COMMON_HTTP_CODE,
  LIVE_ROOM_MODEL_EXCLUDE,
  THIRD_PLATFORM,
} from '@/constant';
import { IList } from '@/interface';
import areaModel from '@/model/area.model';
import { CustomError } from '@/model/customError.model';
import liveRoomModel from '@/model/liveRoom.model';
import qqUserModel from '@/model/qqUser.model';
import roleModel from '@/model/role.model';
import userModel from '@/model/user.model';
import walletModel from '@/model/wallet.model';
import wechatUserModel from '@/model/wechatUser.model';
import { IUser } from '@/types/IUser';
import {
  handleKeyWord,
  handleOrder,
  handlePage,
  handlePaging,
  handleRangTime,
} from '@/utils';

class UserService {
  /** 用户是否存在 */
  async isExist(ids: number[]) {
    const res = await userModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  async login({ id, password }: IUser) {
    const result = await userModel.findOne({
      attributes: {
        exclude: ['password', 'token'],
      },
      where: {
        id,
        password,
      },
    });
    return result;
  }

  async usernameLogin({ username, password }: IUser) {
    const result = await userModel.findOne({
      attributes: {
        exclude: ['password', 'token'],
      },
      where: {
        username,
        password,
      },
    });
    return result;
  }

  /** 获取用户列表 */
  // async getList({
  //   id,
  //   orderBy,
  //   orderName,
  //   nowPage,
  //   pageSize,
  //   keyWord,
  //   rangTimeType,
  //   rangTimeStart,
  //   rangTimeEnd,
  // }: IList<IUser>) {
  //   const { offset, limit } = handlePage({ nowPage, pageSize });
  //   const allWhere: any = deleteUseLessObjectKey({
  //     id,
  //   });
  //   const keyWordWhere = handleKeyWord({
  //     keyWord,
  //     arr: ['username'],
  //   });
  //   if (keyWordWhere) {
  //     allWhere[Op.or] = keyWordWhere;
  //   }
  //   const rangTimeWhere = handleRangTime({
  //     rangTimeType,
  //     rangTimeStart,
  //     rangTimeEnd,
  //   });
  //   if (rangTimeWhere) {
  //     allWhere[rangTimeType!] = rangTimeWhere;
  //   }
  //   const orderRes = handleOrder({ orderName, orderBy });
  //   const result = await userModel.findAndCountAll({
  //     attributes: {
  //       exclude: ['password', 'token'],
  //     },
  //     order: [...orderRes],
  //     limit,
  //     offset,
  //     where: {
  //       ...allWhere,
  //     },
  //     distinct: true,
  //   });
  //   return handlePaging(result, nowPage, pageSize);
  // }
  async getList({
    id,
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<IUser>) {
    const { offset, limit } = handlePage({ nowPage, pageSize });

    const allWhere: any = deleteUseLessObjectKey({ id });

    // 处理关键字搜索
    const keyWordWhere = handleKeyWord({
      keyWord,
      arr: ['username'],
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

    // 处理排序规则
    // const orderRes = handleOrder({ orderName, orderBy });

    // **统计粉丝数和视频数，排除已软删除的记录**
    // 粉丝数
    const followersQuery = `
      (SELECT COUNT(*) 
       FROM user_follows
       WHERE user_follows.following_id = user.id 
         AND user_follows.deleted_at IS NULL)`;

    // 视频数
    const videosQuery = `
      (SELECT COUNT(*) 
       FROM user_videos
       WHERE user_videos.user_id = user.id 
         AND user_videos.deleted_at IS NULL)`;

    // 评论数
    const commentsQuery = `
         (SELECT COUNT(*) 
          FROM ws_message 
          WHERE ws_message.user_id = user.id 
            AND ws_message.msg_type = 0 
            AND ws_message.deleted_at IS NULL)`;

    // 观看的直播间数量
    const watchCountQuery = `
         (SELECT COUNT(DISTINCT views.live_room_id) 
          FROM user_live_views AS views
          WHERE views.user_id = user.id)`;

    // 点赞数
    const likesCountQuery = `
         (SELECT COUNT(*) 
          FROM ws_message 
          WHERE ws_message.user_id = user.id 
            AND ws_message.msg_type = 6 
            AND ws_message.deleted_at IS NULL)`;

    // 送礼数
    const giftCountQuery = `
         (SELECT COUNT(*) 
          FROM ws_message 
          WHERE ws_message.user_id = user.id 
            AND ws_message.msg_type = 5 
            AND ws_message.deleted_at IS NULL)`;

    // 送礼总金额
    const giftAmountQuery = `
         (SELECT COALESCE(SUM(goods.price), 0)
          FROM ws_message
          JOIN goods ON ws_message.content = goods.name
          WHERE ws_message.user_id = user.id
            AND ws_message.msg_type = 5
            AND ws_message.deleted_at IS NULL)`;

    // 签到次数
    const signinQuery = `
         (SELECT COUNT(*) 
          FROM signin_record 
          WHERE signin_record.user_id = user.id)`;

    // 直播次数
    const liveCountQuery = `
         (SELECT COUNT(*) 
          FROM live_record 
          WHERE live_record.user_id = user.id)`;

    // 总直播时长
    const liveDurationQuery = `
         (SELECT COALESCE(SUM(TIMESTAMPDIFF(SECOND, live_record.start_time, live_record.end_time)), 0)
          FROM live_record
          WHERE live_record.user_id = user.id)`;

    // **计算综合排序得分（rank_score）**
    const rankScoreQuery = `
        (
            LOG(GREATEST(${followersQuery}, 1)) * 4 + 
            LOG(GREATEST(${videosQuery}, 1)) * 3 + 
            LOG(GREATEST(${commentsQuery}, 1)) * 2 + 
            LOG(GREATEST(${watchCountQuery}, 1)) * 3 + 
            LOG(GREATEST(${likesCountQuery}, 1)) * 2 + 
            LOG(GREATEST(${giftCountQuery}, 1)) * 5 +
            LOG(GREATEST(${giftAmountQuery}, 1)) * 4 +
            LOG(GREATEST(${signinQuery}, 1)) * 2 +
            LOG(GREATEST(${liveCountQuery}, 1)) * 3 +
            LOG(GREATEST(${liveDurationQuery} / 3600, 1)) * 2
        )`;

    // **统计人气榜的各项指标**
    // **统计用户视频观看次数**
    const videoViewsQuery = `
      (SELECT COUNT(*) 
       FROM user_video_views 
       WHERE user_video_views.video_id IN (
           SELECT user_videos.id 
           FROM user_videos 
           WHERE user_videos.user_id = user.id
       ))`;
    // **统计用户直播间被观看人数**
    const liveRoomViewsQuery = `
      (SELECT COUNT(DISTINCT views.user_id) 
       FROM user_live_views AS views 
       WHERE views.live_room_id IN 
         (SELECT live_room_id FROM user_live_room WHERE user_live_room.user_id = user.id))`;

    // **统计用户直播间点赞数**
    const liveRoomLikesQuery = `
      (SELECT COUNT(*) 
       FROM ws_message 
       WHERE ws_message.live_room_id IN 
         (SELECT live_room_id FROM user_live_room WHERE user_live_room.user_id = user.id) 
         AND ws_message.msg_type = 6 
         AND ws_message.deleted_at IS NULL)`;

    // **统计用户直播间评论数**
    const liveRoomCommentsQuery = `
      (SELECT COUNT(*) 
       FROM ws_message 
       WHERE ws_message.live_room_id IN 
         (SELECT live_room_id FROM user_live_room WHERE user_live_room.user_id = user.id) 
         AND ws_message.msg_type = 0 
         AND ws_message.deleted_at IS NULL)`;

    // **统计用户收到的礼物数量**
    const receiveGiftCountQuery = `
      (SELECT COUNT(*) 
       FROM ws_message 
       WHERE ws_message.live_room_id IN 
         (SELECT live_room_id FROM user_live_room WHERE user_live_room.user_id = user.id) 
         AND ws_message.msg_type = 5 
         AND ws_message.deleted_at IS NULL)`;

    // **统计用户收到的礼物总金额**
    const receiveGiftAmountQuery = `
      (SELECT COALESCE(SUM(goods.price), 0) 
       FROM ws_message 
       JOIN goods ON ws_message.content = goods.name 
       WHERE ws_message.live_room_id IN 
         (SELECT live_room_id FROM user_live_room WHERE user_live_room.user_id = user.id) 
         AND ws_message.msg_type = 5 
         AND ws_message.deleted_at IS NULL)`;

    // **计算 `popularity` 综合热度得分**
    const popularityScoreQuery = `
      (
          LOG(GREATEST(${followersQuery}, 1)) * 3 + 
          LOG(GREATEST(${videoViewsQuery}, 1)) * 4 + 
          LOG(GREATEST(${liveRoomViewsQuery}, 1)) * 5 +
          LOG(GREATEST(${liveRoomLikesQuery}, 1)) * 4 + 
          LOG(GREATEST(${liveRoomCommentsQuery}, 1)) * 3 +
          LOG(GREATEST(${giftCountQuery}, 1)) * 4 +
          LOG(GREATEST(${giftAmountQuery}, 1)) * 5
      )`;

    // **排序逻辑**
    let orderRes: any = [];
    if (orderBy === 'highToLow') {
      orderRes = [[sequelize.literal(`(${followersQuery})`), 'DESC']]; // **粉丝数降序**
    } else if (orderBy === 'lowToHigh') {
      orderRes = [[sequelize.literal(`(${followersQuery})`), 'ASC']]; // **粉丝数升序**
    } else if (orderBy === 'popularity') {
      orderRes = [[sequelize.literal(`(${popularityScoreQuery})`), 'DESC']]; // **按综合热度排序**
    } else {
      // **综合排序**
      orderRes = [[sequelize.literal(`(${rankScoreQuery})`), 'DESC']];
    }

    const result = await userModel.findAndCountAll({
      attributes: {
        exclude: ['password', 'token'],
        include: [
          [sequelize.literal(`(${followersQuery})`), 'followers_count'], // 粉丝数
          [sequelize.literal(`(${videosQuery})`), 'videos_count'], // 视频数
          [sequelize.literal(`(${commentsQuery})`), 'comments_count'], // 弹幕数
          [sequelize.literal(`(${watchCountQuery})`), 'watch_count'], // 观看直播次数
          [sequelize.literal(`(${likesCountQuery})`), 'likes_count'], // 点赞数
          [sequelize.literal(`(${giftCountQuery})`), 'gift_count'], // 赠送礼物数
          [sequelize.literal(`(${giftAmountQuery})`), 'gift_amount'], // 赠送礼物金额
          [sequelize.literal(`(${signinQuery})`), 'signin_count'], // 签到次数
          [sequelize.literal(`(${liveCountQuery})`), 'live_count'], // 开播次数
          [sequelize.literal(`(${liveDurationQuery})`), 'live_duration'], // 开播总时长（秒）
          [sequelize.literal(`(${rankScoreQuery})`), 'rank_score'], // 综合排序分数
          [sequelize.literal(`(${popularityScoreQuery})`), 'popularity_score'], // *人气热度分数**
        ],
      },
      order: [...orderRes],
      limit,
      offset,
      where: allWhere,
      distinct: true,
    });

    return handlePaging(result, nowPage, pageSize);
  }

  /** 根据id查找用户（不返回password，但返回token） */
  async findAndToken(id: number) {
    const result = await userModel.findOne({
      include: [
        {
          model: roleModel,
          through: { attributes: [] },
        },
      ],
      attributes: {
        exclude: ['password'],
      },
      where: { id },
    });
    return result;
  }

  /** 根据id查找用户（password和token都不返回） */
  async find(id: number) {
    const result = await userModel.findOne({
      attributes: {
        exclude: ['password', 'token'],
      },
      where: { id },
    });
    return result;
  }

  /** 根据id查找用户密码 */
  async findPwd(id: number) {
    const result = await userModel.findOne({
      where: { id },
      attributes: ['password'],
    });
    return result;
  }

  /** 根据id修改用户密码 */
  async updatePwd({ id, password, token }: IUser) {
    const result = await userModel.update(
      { password, token },
      { where: { id }, limit: 1 }
    );
    return result;
  }

  /** 根据id查找用户（包括其他账号信息） */
  async findAccount(id: number) {
    const result = await userModel.findOne({
      include: [
        {
          model: roleModel,
          through: { attributes: [] },
        },
        {
          model: qqUserModel,
          through: {
            attributes: ['third_platform'],
            where: {
              third_platform: THIRD_PLATFORM.qq,
            },
          },
        },
        {
          model: liveRoomModel,
          attributes: {
            exclude: LIVE_ROOM_MODEL_EXCLUDE,
          },
          through: {
            attributes: [],
          },
          include: [
            {
              model: areaModel,
              through: {
                attributes: [],
              },
            },
          ],
        },
      ],
      attributes: {
        exclude: ['password', 'token'],
      },
      where: { id },
    });
    return result;
  }

  /** 获取用户信息 */
  async getUserInfo(id: number) {
    const result = await userModel.findOne({
      include: [
        {
          model: qqUserModel,
          through: {
            attributes: ['third_platform'],
            where: {
              third_platform: THIRD_PLATFORM.qq,
            },
          },
        },
        {
          model: wechatUserModel,
          through: {
            attributes: ['third_platform'],
            where: {
              third_platform: THIRD_PLATFORM.wechat,
            },
          },
        },
        {
          model: liveRoomModel,
          include: [
            {
              model: areaModel,
              through: {
                attributes: [],
              },
            },
          ],
          through: {
            attributes: [],
          },
        },
        {
          model: roleModel,
          through: { attributes: [] },
        },
        {
          model: walletModel,
        },
      ],
      attributes: {
        exclude: ['password', 'token'],
        include: [
          // [
          //   literal(
          //     `(select count(*) from comment where from_user_id = ${id})`
          //   ),
          //   'comment_total',
          // ],
          // [
          //   literal(`(select count(*) from star where to_user_id = ${id})`),
          //   'receive_star_total',
          // ],
        ],
      },
      where: { id },
    });
    return result;
  }

  /** 是否同名，区分大小写。同名则返回同名用户的信息,否则返回null */
  async isSameName(username: string) {
    const result = await userModel.findOne({
      attributes: {
        exclude: ['password', 'token'],
      },
      // @ts-ignore
      where: {
        username: where(literal(`BINARY username`), username),
      },
    });
    return result;
  }

  /** 根据id修改用户 */
  async update({ id, username, desc, status, avatar, token }: IUser) {
    const result = await userModel.update(
      { username, desc, status, avatar, token },
      { where: { id }, limit: 1 }
    );
    return result;
  }

  /** 创建用户 */
  async create(data: IUser) {
    const result = await userModel.create(data);
    return result;
  }

  /** 删除用户 */
  async delete(id: number) {
    const result = await userModel.destroy({
      where: { id },
      limit: 1,
      individualHooks: true,
    });
    return result;
  }

  /** 更新用户头像 */
  async updateAvatar(id: number, avatarUrl: string) {
    const result = await userModel.update(
      { avatar: avatarUrl },
      { where: { id }, limit: 1 }
    );
    return result;
  }

  /** 更新用户信息 */
  async updateUserInfo({ id, username, desc, gender, birth_date }: IUser) {
    // 检查是否有其他用户使用相同的用户名
    const existingUser = await userModel.findOne({
      where: {
        username,
        id: {
          [Op.ne]: id, // 确保排除自己
        },
      },
    });

    if (existingUser) {
      throw new CustomError(
        `用户名 "${username}" 已被其他用户占用，请选择其他用户名！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }

    // 更新用户信息
    const result = await userModel.update(
      { username, desc, gender, birth_date },
      { where: { id }, limit: 1 }
    );

    return result;
  }

  /** 根据用户名关键字查找用户列表（带分页） */
  async searchByUsernameWithPagination({
    keyWord,
    nowPage,
    pageSize,
    orderBy,
    orderName,
  }: IList<IUser>) {
    if (!keyWord) {
      throw new CustomError(
        '搜索关键字不能为空！',
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }

    const { offset, limit } = handlePage({ nowPage, pageSize });

    const allWhere: any = {
      username: {
        [Op.like]: `%${keyWord}%`, // **模糊匹配用户名**
      },
    };

    const orderRes = handleOrder({ orderName, orderBy });
    if (!orderRes.length) {
      orderRes.push(['created_at', 'DESC']); // **默认按创建时间降序**
    }

    const result = await userModel.findAndCountAll({
      attributes: {
        exclude: ['password', 'token'],
      },
      where: allWhere,
      order: orderRes,
      limit,
      offset,
      distinct: true,
    });

    return handlePaging(result, nowPage, pageSize);
  }
}

export default new UserService();
