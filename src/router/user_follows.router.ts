import userFollowController from '@/controller/user_follows.controller';
import Router from 'koa-router';

const userFollowRouter = new Router({ prefix: '/user_follows' });

/**
 *  获取用户关注的列表
 *  请求示例：GET /api/user_follows/following?userId=1
 */
userFollowRouter.get('/following', userFollowController.getFollowingList);

/**
 * 获取用户的粉丝列表
 * 请求示例：GET /api/user_follows/followers?userId=1
 */
userFollowRouter.get('/followers', userFollowController.getFollowerList);

/**
 * 用户关注接口
 * 请求示例：POST /api/user_follows/follow
 * 请求体：{ followerId: 1, followingId: 2 }
 */
userFollowRouter.post('/follow', userFollowController.createFollow);

/**
 * 用户取消关注接口
 * 请求示例：POST /api/user_follows/unfollow
 * 请求体：{ followerId: 1, followingId: 2 }
 */
userFollowRouter.post('/unfollow', userFollowController.unfollow);

/**
 * 根据关键字查找用户关注的列表
 * 请求示例：GET /api/user_follows/following/search?userId=1&keyword=John
 */
userFollowRouter.get(
  '/following/search',
  userFollowController.searchFollowingListByKeyword
);

/**
 * 根据关键字查找用户的粉丝列表
 * 请求示例：GET /api/user_follows/followers/search?userId=1&keyword=John
 */
userFollowRouter.get(
  '/followers/search',
  userFollowController.searchFollowerListByKeyword
);

/**
 * 获取用户关注的用户及其最新直播记录
 * 请求示例：GET /api/user_follows/following/records?userId=1
 */
userFollowRouter.get(
  '/following/records',
  userFollowController.getFollowedUsersWithLiveRecords
);

/**
 * 获取用户关注的没有开播过的用户
 * 请求示例：GET /api/user_follows/following/no_live?userId=1
 */
userFollowRouter.get(
  '/following/no_live',
  userFollowController.getUsersWhoNeverStreamed
);

export default userFollowRouter;
