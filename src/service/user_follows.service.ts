import liveModel from '@/model/live.model';
import liveRecordModel from '@/model/liveRecord.model';
import liveRoomModel from '@/model/liveRoom.model';
import userModel from '@/model/user.model';
import userFollowModel from '@/model/user_follows.model';
import { Op } from 'sequelize';

class UserFollowService {
  /**
   * 获取指定用户的关注列表
   * @param userId 用户 ID
   * @returns 关注的用户详细信息
   */
  async getFollowingList(userId: number) {
    // 查询 user_follows 表，获取该用户关注的所有 `following_id`
    const follows = await userFollowModel.findAll({
      attributes: ['following_id'],
      where: { follower_id: userId },
    });

    // 提取所有被关注的用户 ID，并过滤掉 undefined
    const followingIds = follows
      .map((follow) => follow.following_id)
      .filter((id): id is number => id !== undefined);

    if (followingIds.length === 0) {
      return []; // 如果没有关注任何用户，返回空数组
    }

    // 查询 users 表，获取所有被关注的用户详细信息
    const followingUsers = await userModel.findAll({
      where: { id: { [Op.in]: followingIds } }, // 确保 followingIds 没有 undefined
      attributes: { exclude: [] }, // 这样会返回所有字段
    });

    return followingUsers;
  }

  /**
   * 获取指定用户的粉丝列表
   * @param userId 用户 ID
   * @returns 粉丝的详细信息列表
   */
  async getFollowerList(userId: number) {
    // 查询 user_follows 表，获取所有 `follower_id`（即粉丝）
    const follows = await userFollowModel.findAll({
      attributes: ['follower_id'],
      where: { following_id: userId }, // 查询关注 userId 的所有用户
    });

    // 提取粉丝的 ID，并过滤掉 undefined
    const followerIds = follows
      .map((follow) => follow.follower_id)
      .filter((id): id is number => id !== undefined);

    if (followerIds.length === 0) {
      return [];
    }

    // 查询 users 表，获取所有粉丝的详细信息
    const followers = await userModel.findAll({
      where: { id: { [Op.in]: followerIds } },
      attributes: { exclude: [] }, // 返回所有字段
    });

    return followers;
  }

  /** 判断用户是否已关注 */
  async isFollowing(followerId: number, followingId: number) {
    const result = await userFollowModel.count({
      where: {
        follower_id: followerId,
        following_id: followingId,
      },
    });
    return result > 0;
  }

  /** 创建关注关系 */
  async createFollow(followerId: number, followingId: number) {
    // 判断是否已关注
    const isExist = await this.isFollowing(followerId, followingId);
    if (isExist) {
      throw new Error('You are already following this user');
    }

    // 创建关注关系
    const result = await userFollowModel.create({
      follower_id: followerId,
      following_id: followingId,
    });

    return result;
  }

  /** 取消关注 */
  async unfollow(followerId: number, followingId: number) {
    // 删除关注关系
    const result = await userFollowModel.destroy({
      where: { follower_id: followerId, following_id: followingId },
    });

    if (result === 0) {
      throw new Error('Follow relationship not found');
    }

    return result;
  }

  /** 查找关注关系 */
  async findFollow(followerId: number, followingId: number) {
    const result = await userFollowModel.findOne({
      where: {
        follower_id: followerId,
        following_id: followingId,
      },
    });
    return result;
  }

  /**
   * 根据关键字查找指定用户的关注列表
   * @param userId 用户 ID
   * @param keyword 关键字
   * @returns 关注的用户详细信息
   */
  async searchFollowingListByKeyword(userId: number, keyword: string) {
    // 查询 user_follows 表，获取该用户关注的所有 `following_id`
    const follows = await userFollowModel.findAll({
      attributes: ['following_id'],
      where: { follower_id: userId },
    });

    const followingIds = follows
      .map((follow) => follow.following_id)
      .filter((id): id is number => id !== undefined);

    if (followingIds.length === 0) {
      return [];
    }

    // 查询 users 表，获取所有符合关键字的被关注的用户
    const followingUsers = await userModel.findAll({
      where: {
        id: { [Op.in]: followingIds },
        [Op.or]: [
          { username: { [Op.like]: `%${keyword}%` } },
          { desc: { [Op.like]: `%${keyword}%` } },
        ],
      },
      attributes: { exclude: [] }, // 返回所有字段
    });

    return followingUsers;
  }

  /**
   * 根据关键字查找指定用户的粉丝列表
   * @param userId 用户 ID
   * @param keyword 关键字
   * @returns 粉丝的详细信息列表
   */
  async searchFollowerListByKeyword(userId: number, keyword: string) {
    // 查询 user_follows 表，获取所有 `follower_id`（即粉丝）
    const follows = await userFollowModel.findAll({
      attributes: ['follower_id'],
      where: { following_id: userId },
    });

    const followerIds = follows
      .map((follow) => follow.follower_id)
      .filter((id): id is number => id !== undefined);

    if (followerIds.length === 0) {
      return [];
    }

    // 查询 users 表，获取所有符合关键字的粉丝
    const followers = await userModel.findAll({
      where: {
        id: { [Op.in]: followerIds },
        [Op.or]: [
          { username: { [Op.like]: `%${keyword}%` } },
          { desc: { [Op.like]: `%${keyword}%` } },
        ],
      },
      attributes: { exclude: [] }, // 返回所有字段
    });

    return followers;
  }

  // 获取指定用户关注的用户信息，以及他们的最新直播记录
  async getFollowedUsersWithLiveRecords(userId: number) {
    // 获取当前用户关注的所有用户ID
    const follows = await userFollowModel.findAll({
      attributes: ['following_id'],
      where: { follower_id: userId },
    });

    // 过滤掉 undefined 值并确保类型为 number[]
    const followingIds: number[] = follows
      .map((follow) => follow.following_id)
      .filter((id): id is number => id !== undefined); // 使用类型谓词

    if (followingIds.length === 0) {
      return { liveUsers: [], offlineUsers: [] }; // 返回两个空数组
    }

    // 查询这些关注用户的详细信息（包括用户名和头像）
    const followedUsers = await userModel.findAll({
      where: { id: { [Op.in]: followingIds } },
      attributes: ['id', 'username', 'avatar'], // 获取所需字段
    });

    // 查询这些关注用户的最新直播记录（如果有的话），并联接 live_room 获取名称
    const liveRecords = await liveRecordModel.findAll({
      where: { user_id: { [Op.in]: followingIds } },
      include: [
        {
          model: liveRoomModel, // 假设 live_room 是关联模型
          attributes: [
            'name',
            'cover_img',
            'parent_category_id',
            'child_category_id',
          ], // 获取 room_name
        },
      ],
      order: [['start_time', 'DESC']], // 按开始时间降序排列
    });

    // 查询这些关注用户的直播状态
    const liveStatus = await liveModel.findAll({
      where: { user_id: { [Op.in]: followingIds } },
    });

    // 将关注用户的直播状态信息补充到用户数据中
    const liveUsers: any = [];
    const offlineUsers: any = [];

    followedUsers.forEach((user) => {
      const liveRecord = liveRecords.find(
        (record) => record.user_id === user.id
      );

      // 判断是否正在直播（如果在live表中能找到该用户id的数据，则说明正在直播）
      const isLive = liveStatus.some((live) => live.user_id === user.id); // 判断是否正在直播

      // 如果没有找到对应的直播记录，直接跳过
      if (!liveRecord && !isLive) {
        return; // 如果该用户没有直播记录，跳过处理
      }

      const liveStatusField = isLive ? 'live' : 'not live'; // 当前直播状态
      let lastLiveTime;
      let liveRoomName;

      if (!isLive && liveRecord) {
        // 如果不在直播，计算最后一次直播的时间差
        lastLiveTime = liveRecord.start_time;
      }

      if (liveRecord && liveRecord.live_room) {
        // 获取 live_room 中的 name 字段
        liveRoomName = liveRecord.live_room.name;
      }

      const userData = {
        ...user.toJSON(),
        liveStatus: liveStatusField, // 当前直播状态
        lastLiveTime, // 上一次直播的开始时间
        liveRoomName, // 直播间的名字
        // liveRecord 对象的所有字段
        liveRecord: liveRecord || null,
      };

      if (isLive) {
        liveUsers.push(userData); // 将正在直播的用户添加到 liveUsers 列表
      } else {
        offlineUsers.push(userData); // 将不在直播的用户添加到 offlineUsers 列表
      }
    });

    return { liveUsers, offlineUsers }; // 返回两个列表
  }

  // 获取没有开播过的关注用户
  async getUsersWhoNeverStreamed(userId: number) {
    // 获取当前用户关注的所有用户ID
    const follows = await userFollowModel.findAll({
      attributes: ['following_id'],
      where: { follower_id: userId },
    });

    // 过滤掉 undefined 值并确保类型为 number[]
    const followingIds: number[] = follows
      .map((follow) => follow.following_id)
      .filter((id): id is number => id !== undefined); // 使用类型谓词

    if (followingIds.length === 0) {
      return { noLiveUsers: [] }; // 如果没有关注任何用户，返回空数组
    }

    // 查询这些关注用户的详细信息（包括用户名和头像）
    const followedUsers = await userModel.findAll({
      where: { id: { [Op.in]: followingIds } },
      attributes: ['id', 'username', 'avatar'], // 获取所需字段
    });

    // 查询这些关注用户是否有开播记录
    const liveRecords = await liveRecordModel.findAll({
      where: { user_id: { [Op.in]: followingIds } },
    });

    // 筛选出从未开播过的关注用户
    const noLiveUsers = followedUsers.filter((user) => {
      // 如果该用户在 liveRecord 中没有记录，则说明该用户没有开播过
      return !liveRecords.some((record) => record.user_id === user.id);
    });

    return { noLiveUsers }; // 返回没有开播过的用户列表
  }
}

export default new UserFollowService();
