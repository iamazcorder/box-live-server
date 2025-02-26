import successHandler from '@/app/handler/success-handle';
import { CustomError } from '@/model/customError.model';
import userFollowService from '@/service/user_follows.service';
import { ParameterizedContext } from 'koa';

class UserFollowController {
  /**
   *  获取指定用户的关注列表
   */
  async getFollowingList(ctx: ParameterizedContext, next) {
    const userId = parseInt(ctx.query.userId as string, 10);

    // 校验 userId 是否有效
    if (!userId || isNaN(userId)) {
      throw new CustomError('userId 参数无效', 400, 400);
    }

    // 获取关注列表
    const result = await userFollowService.getFollowingList(userId);

    // 返回 JSON 响应
    successHandler({ ctx, data: result });

    await next();
  }

  /**
   * 获取用户的粉丝列表
   * @param ctx Koa 请求上下文
   */
  async getFollowerList(ctx: ParameterizedContext, next) {
    const userId = parseInt(ctx.query.userId as string, 10);

    // 校验 userId 是否有效
    if (!userId || isNaN(userId)) {
      throw new CustomError('userId 参数无效', 400, 400);
    }

    // 获取粉丝列表
    const result = await userFollowService.getFollowerList(userId);

    // 返回 JSON 响应
    successHandler({ ctx, data: result });

    await next();
  }

  /**
   * 用户关注
   */
  async createFollow(ctx: ParameterizedContext, next) {
    const { followerId, followingId } = ctx.request.body;

    if (!followerId || !followingId) {
      throw new CustomError('followerId 或 followingId 无效', 400, 400);
    }

    try {
      const result = await userFollowService.createFollow(
        followerId,
        followingId
      );
      successHandler({ ctx, data: result });
    } catch (error) {
      // throw new CustomError(error.message, 400, 400);
    }

    await next();
  }

  /**
   * 用户取消关注
   */
  async unfollow(ctx: ParameterizedContext, next) {
    const { followerId, followingId } = ctx.request.body;

    if (!followerId || !followingId) {
      throw new CustomError('followerId 或 followingId 无效', 400, 400);
    }

    try {
      const result = await userFollowService.unfollow(followerId, followingId);
      successHandler({ ctx, data: result });
    } catch (error) {
      // throw new CustomError(error.message, 400, 400);
    }

    await next();
  }

  /**
   * 根据关键字查找用户关注的列表
   */
  async searchFollowingListByKeyword(ctx: ParameterizedContext, next) {
    const userId = parseInt(ctx.query.userId as string, 10);
    const keyword = ctx.query.keyword as string;

    if (!userId || isNaN(userId)) {
      throw new CustomError('userId 参数无效', 400, 400);
    }

    if (!keyword) {
      throw new CustomError('keyword 参数不能为空', 400, 400);
    }

    // 查找关注列表
    const result = await userFollowService.searchFollowingListByKeyword(
      userId,
      keyword
    );

    successHandler({ ctx, data: result });

    await next();
  }

  /**
   * 根据关键字查找用户的粉丝列表
   */
  async searchFollowerListByKeyword(ctx: ParameterizedContext, next) {
    const userId = parseInt(ctx.query.userId as string, 10);
    const keyword = ctx.query.keyword as string;

    if (!userId || isNaN(userId)) {
      throw new CustomError('userId 参数无效', 400, 400);
    }

    if (!keyword) {
      throw new CustomError('keyword 参数不能为空', 400, 400);
    }

    // 查找粉丝列表
    const result = await userFollowService.searchFollowerListByKeyword(
      userId,
      keyword
    );

    successHandler({ ctx, data: result });

    await next();
  }
  /**
   * 获取用户关注的用户及其最新直播记录
   * 请求示例：GET /api/user_follows/following/records?userId=1
   */
  async getFollowedUsersWithLiveRecords(ctx: ParameterizedContext, next) {
    const userId = parseInt(ctx.query.userId as string, 10);

    if (!userId || isNaN(userId)) {
      throw new CustomError('userId 参数无效', 400, 400);
    }

    const { liveUsers, offlineUsers } =
      await userFollowService.getFollowedUsersWithLiveRecords(userId);

    successHandler({ ctx, data: { liveUsers, offlineUsers } });

    await next();
  }
  /**
   * 获取没有开播过的关注用户
   * 请求示例：GET /api/user_follows/no-live-users?userId=1
   */
  async getUsersWhoNeverStreamed(ctx: ParameterizedContext, next) {
    const userId = parseInt(ctx.query.userId as string, 10);

    // 验证 userId 参数
    if (!userId || isNaN(userId)) {
      throw new CustomError('userId 参数无效', 400, 400);
    }

    try {
      // 调用服务层获取从未开播过的用户
      const result = await userFollowService.getUsersWhoNeverStreamed(userId);

      // 统一成功返回
      successHandler({ ctx, data: result });
    } catch (error) {
      // 捕获错误并抛出自定义错误
      // throw new CustomError(error.message || '获取没有开播过的关注用户失败', 500, 500);
    }

    await next(); // 如果有其他中间件，继续执行
  }
}

export default new UserFollowController();
