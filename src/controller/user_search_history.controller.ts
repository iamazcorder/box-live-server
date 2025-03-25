import successHandler from '@/app/handler/success-handle';
import { COMMON_HTTP_CODE } from '@/constant';
import { IList } from '@/interface';
import { CustomError } from '@/model/customError.model';
import userSearchHistoryService from '@/service/user_search_history.service';
import { ParameterizedContext } from 'koa';

class UserSearchHistoryController {
  /** 获取用户搜索历史列表 */
  list = async (ctx: ParameterizedContext, next) => {
    const {
      user_id,
      nowPage,
      pageSize,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    }: IList<any> = ctx.request.query;

    if (!user_id) {
      throw new CustomError(
        'user_id 不能为空！',
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }

    const result = await userSearchHistoryService.getList({
      user_id,
      nowPage,
      pageSize,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    });

    successHandler({ ctx, data: result });
    await next();
  };

  /** 记录用户搜索历史 */
  create = async (ctx: ParameterizedContext, next) => {
    const { user_id, search_keyword } = ctx.request.body;

    if (!user_id || !search_keyword) {
      throw new CustomError(
        'user_id 和 search_keyword 不能为空！',
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }

    const result = await userSearchHistoryService.create({
      user_id,
      search_keyword,
    });

    successHandler({ ctx, data: result, msg: '搜索历史记录成功！' });
    await next();
  };

  /** 软删除单个搜索历史 */
  softDelete = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.params.id;

    if (!id) {
      throw new CustomError(
        'id 不能为空！',
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }

    await userSearchHistoryService.softDelete(id);

    successHandler({ ctx, msg: '搜索历史已删除（软删除）！' });
    await next();
  };

  /** 清空用户搜索历史（软删除） */
  clearHistory = async (ctx: ParameterizedContext, next) => {
    const { user_id } = ctx.request.body;

    if (!user_id) {
      throw new CustomError(
        'user_id 不能为空！',
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }

    await userSearchHistoryService.clearHistory(user_id);

    successHandler({ ctx, msg: '搜索历史已清空（软删除）！' });
    await next();
  };

  /** 硬删除单个搜索历史 */
  delete = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.request.body.id;

    if (!id) {
      throw new CustomError(
        'id 不能为空！',
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }

    await userSearchHistoryService.delete(id);

    successHandler({ ctx, msg: '搜索历史已永久删除！' });
    await next();
  };
}

export default new UserSearchHistoryController();
