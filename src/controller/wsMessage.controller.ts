import { ParameterizedContext } from 'koa';

import successHandler from '@/app/handler/success-handle';
import { COMMON_HTTP_CODE, MSG_MAX_LENGTH, REDIS_PREFIX } from '@/constant';
import redisController from '@/controller/redis.controller';
import { IList, IWsMessage } from '@/interface';
import { CustomError } from '@/model/customError.model';
import wsMessageService from '@/service/wsMessage.service';

class WsMessageController {
  common = {
    // 根据id查找消息
    find: (id: number) => wsMessageService.find(id),
    // 根据直播记录id获取消息数
    getCountByLiveRecordId: (live_record_id: number) =>
      wsMessageService.getCountByLiveRecordId(live_record_id),
    // 创建消息
    create: ({
      live_record_id,
      username,
      origin_username,
      content_type,
      content,
      origin_content,
      live_room_id,
      user_id,
      client_ip,
      msg_type,
      user_agent,
      send_msg_time,
      is_show,
      remark,
    }: IWsMessage) => {
      if (content && content?.length > MSG_MAX_LENGTH) {
        throw new CustomError(
          `消息长度最大${MSG_MAX_LENGTH}！`,
          COMMON_HTTP_CODE.paramsError,
          COMMON_HTTP_CODE.paramsError
        );
      }
      return wsMessageService.create({
        live_record_id,
        username,
        origin_username,
        content_type,
        content,
        origin_content,
        live_room_id,
        user_id,
        client_ip,
        msg_type,
        user_agent,
        send_msg_time,
        is_show,
        remark,
      });
    },
    // 更新消息
    update: ({
      id,
      live_record_id,
      username,
      origin_username,
      content_type,
      content,
      origin_content,
      live_room_id,
      user_id,
      client_ip,
      msg_type,
      user_agent,
      send_msg_time,
      is_show,
      remark,
    }) =>
      wsMessageService.update({
        id,
        live_record_id,
        username,
        origin_username,
        content_type,
        content,
        origin_content,
        live_room_id,
        user_id,
        client_ip,
        msg_type,
        user_agent,
        send_msg_time,
        is_show,
        remark,
      }),
    // 更新消息的显示状态
    updateIsShow: ({ id, is_show }: IWsMessage) =>
      wsMessageService.update({ id, is_show }),
    // 获取消息列表，并使用Redis缓存优化性能
    getList: async ({
      id,
      live_record_id,
      username,
      origin_username,
      content_type,
      content,
      origin_content,
      live_room_id,
      user_id,
      client_ip,
      msg_type,
      user_agent,
      send_msg_time,
      is_show,
      remark,
      orderBy,
      orderName,
      nowPage,
      pageSize,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    }: IList<IWsMessage>) => {
      try {
        // 尝试从Redis缓存中获取历史消息
        const oldCache = await redisController.getVal({
          prefix: REDIS_PREFIX.dbLiveRoomHistoryMsgList,
          key: `${live_room_id!}`,
        });
        if (oldCache) {
          // 如果缓存存在，直接返回缓存数据
          return JSON.parse(oldCache).value;
        }
      } catch (error) {
        // 如果Redis操作失败，打印错误
        console.log(error);
      }
      // 如果缓存没有命中，从数据库获取数据
      const result = await wsMessageService.getList({
        id,
        live_record_id,
        username,
        origin_username,
        content_type,
        content,
        origin_content,
        live_room_id,
        user_id,
        client_ip,
        msg_type,
        user_agent,
        send_msg_time,
        is_show,
        remark,
        orderBy,
        orderName,
        nowPage,
        pageSize,
        keyWord,
        rangTimeType,
        rangTimeStart,
        rangTimeEnd,
      });
      try {
        // 将获取到的结果缓存到Redis，设置过期时间为3秒
        redisController.setExVal({
          prefix: REDIS_PREFIX.dbLiveRoomHistoryMsgList,
          key: `${live_room_id!}`,
          value: result,
          exp: 3,
        });
      } catch (error) {
        // 缓存操作失败，打印错误
        console.log(error);
      }
      return result;
    },
  };

  update = async (ctx: ParameterizedContext, next) => {
    const data = ctx.request.body;
    const res = await this.common.update(data);
    successHandler({ ctx, data: res });
    await next();
  };

  getList = async (ctx: ParameterizedContext, next) => {
    const data = ctx.request.query;
    const result = await this.common.getList(data);
    successHandler({ ctx, data: result });
    await next();
  };

  find = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.params.id;
    const result = await this.common.find(id);
    successHandler({ ctx, data: result });
    await next();
  };

  async delete(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const isExist = await wsMessageService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的消息！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    await wsMessageService.delete(id);
    successHandler({ ctx });
    await next();
  }
}

export default new WsMessageController();
