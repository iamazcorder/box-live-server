import successHandler from '@/app/handler/success-handle';
import { COMMON_HTTP_CODE } from '@/constant';
import { IList } from '@/interface';
import { CustomError } from '@/model/customError.model';
import userLiveViewsService from '@/service/user_live_views.service';
import { ParameterizedContext } from 'koa';

class UserLiveViewsController {
  /** 获取用户观看直播记录列表 */
  list = async (ctx: ParameterizedContext, next) => {
    const {
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
    }: IList<any> = ctx.request.query;

    const result = await userLiveViewsService.getList({
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
    });

    successHandler({ ctx, data: result });
    await next();
  };

  /** 根据 ID 获取单个观看直播记录 */
  find = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.params.id;
    const result = await userLiveViewsService.find(id);
    if (!result) {
      throw new CustomError(
        `ID 为 ${id} 的观看直播记录不存在！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    successHandler({ ctx, data: result });
    await next();
  };

  /** 创建用户观看直播记录 */
  create = async (ctx: ParameterizedContext, next) => {
    try {
      const { user_id, live_room_id, duration, watched_at } = ctx.request.body;
      // `watched_at` 由数据库默认设置，如果需要手动传递 `watched_at` 可自行添加

      if (!user_id || !live_room_id) {
        throw new CustomError(
          '用户ID和直播间ID不能为空！',
          COMMON_HTTP_CODE.paramsError,
          COMMON_HTTP_CODE.paramsError
        );
      }

      const data = {
        user_id,
        live_room_id,
        duration,
        watched_at,
      };

      const result = await userLiveViewsService.create(data);
      successHandler({ ctx, data: result, msg: '观看直播记录创建成功！' });
      await next();
    } catch (error: any) {
      console.error('创建观看直播记录失败:', error.message);
      throw new CustomError('创建观看直播记录失败！' + error.message, 500, 500);
    }
  };

  /** 更新用户观看直播记录（更新观看时长） */
  update = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.params.id;
    const { duration } = ctx.request.body;

    if (duration === undefined) {
      throw new CustomError(
        '需要更新观看时长！',
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }

    const isExist = await userLiveViewsService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在 ID 为 ${id} 的观看直播记录！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }

    await userLiveViewsService.update({ id, duration });
    successHandler({ ctx, msg: '观看直播记录更新成功！' });
    await next();
  };

  /** 软删除用户观看直播记录 */
  softDelete = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.params.id;
    const isExist = await userLiveViewsService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在 ID 为 ${id} 的观看直播记录！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    await userLiveViewsService.softDelete(id);
    successHandler({ ctx, msg: '观看直播记录已删除（软删除）！' });
    await next();
  };

  /** 硬删除用户观看直播记录 */
  // delete = async (ctx: ParameterizedContext, next) => {
  //     const id = +ctx.request.body.id;  // 假设采用 `body` 传参
  //     const isExist = await userLiveViewsService.isExist([id]);
  //     if (!isExist) {
  //         throw new CustomError(
  //             `不存在 ID 为 ${id} 的观看直播记录！`,
  //             COMMON_HTTP_CODE.paramsError,
  //             COMMON_HTTP_CODE.paramsError
  //         );
  //     }
  //     await userLiveViewsService.delete(id);
  //     successHandler({ ctx, msg: "观看直播记录已永久删除！" });
  //     await next();
  // };
  delete = async (ctx: ParameterizedContext, next) => {
    const { user_id, live_room_id } = ctx.request.body; // 通过 body 传参

    if (!user_id && !live_room_id) {
      throw new CustomError(
        '至少需要传入 user_id 或 live_room_id！',
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }

    let deletedCount = 0;

    if (user_id && live_room_id) {
      // 删除特定用户的特定视频观看记录
      deletedCount = await userLiveViewsService.deleteByUserAndVideo(
        user_id,
        live_room_id
      );
    } else if (user_id) {
      // 删除该用户的所有观看记录
      deletedCount = await userLiveViewsService.deleteByUser(user_id);
    } else if (live_room_id) {
      // 删除该视频的所有观看记录
      deletedCount = await userLiveViewsService.deleteByVideo(live_room_id);
    }

    if (deletedCount === 0) {
      throw new CustomError(
        `未找到符合条件的观看记录！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }

    successHandler({ ctx, msg: `已删除 ${deletedCount} 条观看记录！` });
    await next();
  };
}

export default new UserLiveViewsController();
