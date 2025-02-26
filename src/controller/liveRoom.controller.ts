import { getRandomString } from 'billd-utils';
import { ParameterizedContext } from 'koa';

import { authJwt } from '@/app/auth/authJwt';
import successHandler from '@/app/handler/success-handle';
import { COMMON_HTTP_CODE, REDIS_PREFIX } from '@/constant';
import areaController from '@/controller/area.controller';
import redisController from '@/controller/redis.controller';
import srsController from '@/controller/srs.controller';
import userLiveRoomController from '@/controller/userLiveRoom.controller';
import { initUser } from '@/init/initUser';
import { IList } from '@/interface';
import { CustomError } from '@/model/customError.model';
import liveRoomService from '@/service/liveRoom.service';
import { ILiveRoom } from '@/types/ILiveRoom';
import { tencentcloudCssUtils } from '@/utils/tencentcloud-css';
import * as crypto from 'crypto-js';
import fs from 'fs';
import path from 'path';

class LiveRoomController {
  common = {
    findKey: (id) => liveRoomService.findKey(id),
    isExist: (ids) => liveRoomService.isExist(ids),
    create: (data: ILiveRoom) => liveRoomService.create(data),
    update: (data: ILiveRoom) => liveRoomService.update(data),
    find: (id: number) => liveRoomService.find(id),
    findPure: (id: number) => liveRoomService.findPure(id),
    getList: ({
      id,
      status,
      is_show,
      is_fake,
      name,
      desc,
      type,
      cdn,
      pull_rtmp_url,
      pull_flv_url,
      pull_hls_url,
      pull_webrtc_url,
      pull_cdn_flv_url,
      pull_cdn_hls_url,
      pull_cdn_rtmp_url,
      pull_cdn_webrtc_url,
      push_rtmp_url,
      push_obs_server,
      push_obs_stream_key,
      push_webrtc_url,
      push_srt_url,
      push_cdn_obs_server,
      push_cdn_obs_stream_key,
      push_cdn_rtmp_url,
      push_cdn_srt_url,
      push_cdn_webrtc_url,
      orderBy,
      orderName,
      nowPage,
      pageSize,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    }: IList<ILiveRoom>) =>
      liveRoomService.getList({
        id,
        status,
        is_show,
        is_fake,
        name,
        desc,
        type,
        cdn,
        pull_rtmp_url,
        pull_flv_url,
        pull_hls_url,
        pull_webrtc_url,
        pull_cdn_flv_url,
        pull_cdn_hls_url,
        pull_cdn_rtmp_url,
        pull_cdn_webrtc_url,
        push_rtmp_url,
        push_obs_server,
        push_obs_stream_key,
        push_webrtc_url,
        push_srt_url,
        push_cdn_obs_server,
        push_cdn_obs_stream_key,
        push_cdn_rtmp_url,
        push_cdn_srt_url,
        push_cdn_webrtc_url,
        orderBy,
        orderName,
        nowPage,
        pageSize,
        keyWord,
        rangTimeType,
        rangTimeStart,
        rangTimeEnd,
      }),
    getPureList: ({
      id,
      status,
      is_show,
      is_fake,
      name,
      desc,
      type,
      cdn,
      pull_rtmp_url,
      pull_flv_url,
      pull_hls_url,
      pull_webrtc_url,
      pull_cdn_flv_url,
      pull_cdn_hls_url,
      pull_cdn_rtmp_url,
      pull_cdn_webrtc_url,
      push_rtmp_url,
      push_obs_server,
      push_obs_stream_key,
      push_webrtc_url,
      push_srt_url,
      push_cdn_obs_server,
      push_cdn_obs_stream_key,
      push_cdn_rtmp_url,
      push_cdn_srt_url,
      push_cdn_webrtc_url,
      orderBy,
      orderName,
      nowPage,
      pageSize,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    }: IList<ILiveRoom>) =>
      liveRoomService.getPureList({
        id,
        status,
        is_show,
        is_fake,
        name,
        desc,
        type,
        cdn,
        pull_rtmp_url,
        pull_flv_url,
        pull_hls_url,
        pull_webrtc_url,
        pull_cdn_flv_url,
        pull_cdn_hls_url,
        pull_cdn_rtmp_url,
        pull_cdn_webrtc_url,
        push_rtmp_url,
        push_obs_server,
        push_obs_stream_key,
        push_webrtc_url,
        push_srt_url,
        push_cdn_obs_server,
        push_cdn_obs_stream_key,
        push_cdn_rtmp_url,
        push_cdn_srt_url,
        push_cdn_webrtc_url,
        orderBy,
        orderName,
        nowPage,
        pageSize,
        keyWord,
        rangTimeType,
        rangTimeStart,
        rangTimeEnd,
      }),
  };

  getList = async (ctx: ParameterizedContext, next) => {
    const params = ctx.request.query;
    const result = await this.common.getList(params);
    successHandler({ ctx, data: result });
    await next();
  };

  getBilibili = async (ctx: ParameterizedContext, next) => {
    const roomId = initUser.user_bilibili.live_room.id || -1;
    const result = await this.common.find(roomId);
    successHandler({ ctx, data: result });
    await next();
  };

  find = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.params.id;
    const result = await this.common.find(id);
    successHandler({ ctx, data: result });
    await next();
  };

  findAndLive = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.params.id;
    const result = await this.common.find(id);
    successHandler({ ctx, data: result });
    await next();
  };

  verifyPkKey = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.params.id;
    const { key } = ctx.request.query;
    const result = await redisController.getVal({
      prefix: REDIS_PREFIX.livePkKey,
      key: `${id}`,
    });
    let pass = false;
    try {
      if (result) {
        const res = JSON.parse(result);
        if (res.value.key === key) {
          pass = true;
        }
      }
    } catch (error) {
      console.log(error);
    }
    successHandler({ ctx, data: pass });
    await next();
  };

  updateKey = async (ctx: ParameterizedContext, next) => {
    const { code, userInfo, msg } = await authJwt(ctx);
    if (code !== COMMON_HTTP_CODE.success || !userInfo) {
      throw new CustomError(msg, code, code);
    }
    const liveRoom = await userLiveRoomController.common.findByUserId(
      userInfo.id || -1
    );
    if (!liveRoom) {
      throw new CustomError(
        `你还没有开通直播间！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    } else {
      const key = getRandomString(30);
      const srsPushRes = srsController.common.getPushUrl({
        userId: userInfo.id!,
        liveRoomId: liveRoom.live_room!.id!,
        type: liveRoom.live_room!.type!,
        key,
      });
      const cdnPushRes = tencentcloudCssUtils.getPushUrl({
        userId: userInfo.id!,
        liveRoomId: liveRoom.live_room!.id!,
        type: liveRoom.live_room!.type!,
        key,
      });
      await this.common.update({
        id: liveRoom.live_room!.id!,
        key,
        push_rtmp_url: srsPushRes.rtmp_url,
        push_obs_server: srsPushRes.obs_server,
        push_obs_stream_key: srsPushRes.obs_stream_key,
        push_webrtc_url: srsPushRes.webrtc_url,
        push_srt_url: srsPushRes.srt_url,

        push_cdn_srt_url: cdnPushRes.srt_url,
        push_cdn_rtmp_url: cdnPushRes.rtmp_url,
        push_cdn_obs_server: cdnPushRes.obs_server,
        push_cdn_obs_stream_key: cdnPushRes.obs_stream_key,
        push_cdn_webrtc_url: cdnPushRes.webrtc_url,
      });
      successHandler({ ctx, data: { srsPushRes, cdnPushRes } });
    }
    await next();
  };

  create = async (ctx: ParameterizedContext, next) => {
    const {
      status,
      is_show,
      is_fake,
      name,
      desc,
      type,
      cdn,
      pull_rtmp_url,
      pull_flv_url,
      pull_hls_url,
      pull_webrtc_url,
      pull_cdn_flv_url,
      pull_cdn_hls_url,
      pull_cdn_rtmp_url,
      pull_cdn_webrtc_url,
      push_rtmp_url,
      push_obs_server,
      push_obs_stream_key,
      push_webrtc_url,
      push_srt_url,
      push_cdn_obs_server,
      push_cdn_obs_stream_key,
      push_cdn_rtmp_url,
      push_cdn_srt_url,
      push_cdn_webrtc_url,
    }: ILiveRoom = ctx.request.body;
    await this.common.create({
      key: getRandomString(20),
      status,
      is_show,
      is_fake,
      name,
      desc,
      type,
      cdn,
      pull_rtmp_url,
      pull_flv_url,
      pull_hls_url,
      pull_webrtc_url,
      pull_cdn_flv_url,
      pull_cdn_hls_url,
      pull_cdn_rtmp_url,
      pull_cdn_webrtc_url,
      push_rtmp_url,
      push_obs_server,
      push_obs_stream_key,
      push_webrtc_url,
      push_srt_url,
      push_cdn_obs_server,
      push_cdn_obs_stream_key,
      push_cdn_rtmp_url,
      push_cdn_srt_url,
      push_cdn_webrtc_url,
    });
    successHandler({ ctx });
    await next();
  };

  update = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.params.id;
    const {
      status,
      is_show,
      is_fake,
      name,
      desc,
      type,
      cdn,
      live_announcement,
      personal_intro,
      pull_rtmp_url,
      pull_flv_url,
      pull_hls_url,
      pull_webrtc_url,
      pull_cdn_flv_url,
      pull_cdn_hls_url,
      pull_cdn_rtmp_url,
      pull_cdn_webrtc_url,
      push_rtmp_url,
      push_obs_server,
      push_obs_stream_key,
      push_webrtc_url,
      push_srt_url,
      push_cdn_obs_server,
      push_cdn_obs_stream_key,
      push_cdn_rtmp_url,
      push_cdn_srt_url,
      push_cdn_webrtc_url,
    }: ILiveRoom = ctx.request.body;
    await this.common.update({
      id,
      status,
      is_show,
      is_fake,
      name,
      desc,
      type,
      cdn,
      live_announcement,
      personal_intro,
      pull_rtmp_url,
      pull_flv_url,
      pull_hls_url,
      pull_webrtc_url,
      pull_cdn_flv_url,
      pull_cdn_hls_url,
      pull_cdn_rtmp_url,
      pull_cdn_webrtc_url,
      push_rtmp_url,
      push_obs_server,
      push_obs_stream_key,
      push_webrtc_url,
      push_srt_url,
      push_cdn_obs_server,
      push_cdn_obs_stream_key,
      push_cdn_rtmp_url,
      push_cdn_srt_url,
      push_cdn_webrtc_url,
    });
    successHandler({ ctx });
    await next();
  };

  updateMyLiveRoom = async (ctx: ParameterizedContext, next) => {
    const { code, userInfo, msg } = await authJwt(ctx);
    if (code !== COMMON_HTTP_CODE.success || !userInfo) {
      throw new CustomError(msg, code, code);
    }
    const liveRoom = await userLiveRoomController.common.findByUserId(
      userInfo.id || -1
    );
    if (!liveRoom) {
      throw new CustomError(
        `你还没有开通直播间！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    const {
      parent_category_id,
      child_category_id,
      live_announcement,
      personal_intro,
      cover_img,
      bg_img,
      name,
      desc,
      type,
      priority,
      forward_bilibili_url,
      forward_douyin_url,
      forward_douyu_url,
      forward_huya_url,
      forward_kuaishou_url,
      forward_xiaohongshu_url,
      areas,
    }: ILiveRoom = ctx.request.body;
    await this.common.update({
      id: liveRoom.live_room?.id,
      parent_category_id,
      child_category_id,
      live_announcement,
      personal_intro,
      cover_img,
      bg_img,
      name,
      desc,
      type,
      priority,
      forward_bilibili_url,
      forward_douyin_url,
      forward_douyu_url,
      forward_huya_url,
      forward_kuaishou_url,
      forward_xiaohongshu_url,
    });
    if (areas) {
      await areaController.common.isExist(areas as number[]);
      // @ts-ignore
      await liveRoom.live_room.setAreas(areas);
    }
    successHandler({ ctx });
    await next();
  };

  /**
   * 上传直播间封面
   */
  async uploadCover(ctx: ParameterizedContext, next: () => Promise<any>) {
    try {
      // 获取上传的文件（koa-body 会把文件放到 ctx.request.files 下）
      const files = ctx.request.files?.cover; // 可能是单个文件或文件数组
      const { id } = ctx.request.body; // 获取 id 字段，假设是通过表单传递的

      if (!files || !id) {
        throw new CustomError('缺少文件或用户ID！', 400, 400);
      }

      // 如果上传的是一个文件数组，则取第一个文件
      const file = Array.isArray(files) ? files[0] : files;

      // 获取文件路径
      const uploadDir = path.join(__dirname, '../../public/img');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // 计算文件的哈希值（使用 crypto-js）
      const fileBuffer = await fs.promises.readFile(file.filepath);

      // 使用 Buffer 转为 Base64 字符串后，再将其转换为 WordArray
      const fileBase64 = fileBuffer.toString('base64');
      const fileWordArray = crypto.enc.Base64.parse(fileBase64); // 转换为 crypto-js 中的 WordArray

      // 判断文件哈希值是否已存在（假设每个文件名是唯一的）
      const filesInDir = await fs.promises.readdir(uploadDir);
      let duplicateFile: string | null = null;

      for (const existingFileName of filesInDir) {
        const existingFilePath = path.join(uploadDir, existingFileName);
        const existingFileBuffer = fs.readFileSync(existingFilePath);

        // 使用相同的转换方式计算现有文件的哈希值
        const existingFileBase64 = existingFileBuffer.toString('base64');
        const existingFileWordArray =
          crypto.enc.Base64.parse(existingFileBase64);

        // 计算现有文件的哈希值
        const existingFileHash = crypto
          .MD5(existingFileWordArray)
          .toString(crypto.enc.Base64);

        if (
          existingFileHash ===
          crypto.MD5(fileWordArray).toString(crypto.enc.Base64)
        ) {
          duplicateFile = existingFileName; // 如果哈希值相同，则找到了重复的文件
          break;
        }
      }

      // 如果找到了重复文件，直接使用该文件的 URL 更新用户头像
      if (duplicateFile) {
        const coverUrl = `http://localhost:8080/img/${duplicateFile}`;
        await liveRoomService.updateCover(id, coverUrl); // 更新数据库中的头像 URL
        successHandler({ ctx, data: { coverUrl }, msg: '封面上传成功！' });
      } else {
        // 否则，保存上传的文件并更新头像 URL
        const filePath = path.join(uploadDir, file.newFilename);
        await fs.promises.rename(file.filepath, filePath); // 移动文件到目标目录

        // 生成头像的 URL
        const coverUrl = `http://localhost:8080/img/${file.newFilename}`;
        await liveRoomService.updateCover(id, coverUrl); // 更新数据库中的头像 URL
        successHandler({ ctx, data: { coverUrl }, msg: '封面上传成功！' });
      }

      await next();
    } catch (error: any) {
      // 错误处理
      console.error('上传封面失败:', error.message);

      // 如果上传过程中出现错误，清理已上传的文件
      const files = ctx.request.files?.avatar;
      if (files) {
        const file = Array.isArray(files) ? files[0] : files;
        const filePath = path.join(
          __dirname,
          '../../public/img',
          file.newFilename
        );
        await fs.promises.unlink(filePath); // 删除已上传的文件
      }

      throw new CustomError('封面上传失败！' + error.message, 500, 500);
    }
  }

  async delete(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const isExist = await liveRoomService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的直播间！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    await liveRoomService.delete(id);
    successHandler({ ctx });
    await next();
  }
}

export default new LiveRoomController();
