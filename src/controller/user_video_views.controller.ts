import successHandler from '@/app/handler/success-handle';
import { COMMON_HTTP_CODE } from '@/constant';
import { IList } from '@/interface';
import { CustomError } from '@/model/customError.model';
import userVideoViewsService from '@/service/user_video_views.service';
import { ParameterizedContext } from 'koa';

class UserVideoViewsController {
  /** 获取用户观看记录列表 */
  list = async (ctx: ParameterizedContext, next) => {
    const {
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
    }: IList<any> = ctx.request.query;

    const result = await userVideoViewsService.getList({
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
    });

    successHandler({ ctx, data: result });
    await next();
  };

  /** 根据 ID 获取单个观看记录 */
  find = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.params.id;
    const result = await userVideoViewsService.find(id);
    if (!result) {
      throw new CustomError(
        `ID 为 ${id} 的观看记录不存在！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    successHandler({ ctx, data: result });
    await next();
  };

  /** 创建用户观看记录 */
  create = async (ctx: ParameterizedContext, next) => {
    try {
      const { user_id, video_id, duration, is_finished, watched_at } =
        ctx.request.body;
      // watched_at、created_at、updated_at 由数据库默认设置，如果需要手动传递 watched_at 可自行添加

      if (!user_id || !video_id) {
        throw new CustomError(
          '用户ID和视频ID不能为空！',
          COMMON_HTTP_CODE.paramsError,
          COMMON_HTTP_CODE.paramsError
        );
      }

      const data = {
        user_id,
        video_id,
        duration,
        is_finished,
        watched_at,
      };

      const result = await userVideoViewsService.create(data);
      successHandler({ ctx, data: result, msg: '观看记录创建成功！' });
      await next();
    } catch (error: any) {
      console.error('创建观看记录失败:', error.message);
      throw new CustomError('创建观看记录失败！' + error.message, 500, 500);
    }
  };

  /** 更新用户观看记录（例如更新观看时长或是否看完） */
  update = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.params.id;
    const { duration, is_finished } = ctx.request.body;

    if (duration === undefined && is_finished === undefined) {
      throw new CustomError(
        '至少需要更新观看时长或是否看完状态！',
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }

    const isExist = await userVideoViewsService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在 ID 为 ${id} 的观看记录！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }

    await userVideoViewsService.update({ id, duration, is_finished });
    successHandler({ ctx, msg: '观看记录更新成功！' });
    await next();
  };

  /** 软删除用户观看记录 */
  softDelete = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.params.id;
    const isExist = await userVideoViewsService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在 ID 为 ${id} 的观看记录！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    await userVideoViewsService.softDelete(id);
    successHandler({ ctx, msg: '观看记录已删除（软删除）！' });
    await next();
  };

  /** 硬删除用户观看记录 */
  // delete = async (ctx: ParameterizedContext, next) => {
  //     const id = +ctx.request.body.id;  // 此处假设采用 body 传参，也可以改成 query 参数
  //     const isExist = await userVideoViewsService.isExist([id]);
  //     if (!isExist) {
  //         throw new CustomError(
  //             `不存在 ID 为 ${id} 的观看记录！`,
  //             COMMON_HTTP_CODE.paramsError,
  //             COMMON_HTTP_CODE.paramsError
  //         );
  //     }
  //     await userVideoViewsService.delete(id);
  //     successHandler({ ctx, msg: "观看记录已永久删除！" });
  //     await next();
  // };
  delete = async (ctx: ParameterizedContext, next) => {
    const { user_id, video_id } = ctx.request.body; // 通过 body 传参

    if (!user_id && !video_id) {
      throw new CustomError(
        '至少需要传入 user_id 或 video_id！',
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }

    let deletedCount = 0;

    if (user_id && video_id) {
      // 删除特定用户的特定视频观看记录
      deletedCount = await userVideoViewsService.deleteByUserAndVideo(
        user_id,
        video_id
      );
    } else if (user_id) {
      // 删除该用户的所有观看记录
      deletedCount = await userVideoViewsService.deleteByUser(user_id);
    } else if (video_id) {
      // 删除该视频的所有观看记录
      deletedCount = await userVideoViewsService.deleteByVideo(video_id);
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

export default new UserVideoViewsController();
