import userSearchHistoryController from '@/controller/user_search_history.controller';
import Router from 'koa-router';

const userSearchHistoryRouter = new Router({ prefix: '/user_serach_history' });

/** 创建用户搜索记录 */
userSearchHistoryRouter.post('/create', userSearchHistoryController.create);

/** 获取用户搜索记录列表 */
userSearchHistoryRouter.get('/list', userSearchHistoryController.list);

/** 清空搜索记录 */
userSearchHistoryRouter.put(
  '/clearHistory',
  userSearchHistoryController.clearHistory
);

/** 软删除用户视频 */
userSearchHistoryRouter.delete(
  '/soft_delete/:id',
  userSearchHistoryController.softDelete
);

/** 硬删除用户视频 */
userSearchHistoryRouter.put('/delete', userSearchHistoryController.delete);

export default userSearchHistoryRouter;
