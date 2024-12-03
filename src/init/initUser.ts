import path from 'path';

import { DEFAULT_ROLE_INFO, SERVER_VIDEO_DIR, VIDEO_DIR } from '@/constant';
import { SwitchEnum } from '@/interface';
import { LiveRoomTypeEnum } from '@/types/ILiveRoom';

export const initLiveRoom = {
  1: {
    id: 1,
    name: '房东的猫-美好事物',
    desc: '房东的猫livehouse合集',
    priority: 2,
    cdn: SwitchEnum.no,
    type: LiveRoomTypeEnum.system,
    area: [1],
    devFFmpeg: false, // 初始化ffmpeg
    prodFFmpeg: false, // 初始化ffmpeg
    devFFmpegLocalFile: path.resolve(VIDEO_DIR, 'fddm_snjs.mp4'),
    prodFFmpegLocalFile: path.resolve(SERVER_VIDEO_DIR, 'fddm_mhsw.mp4'),
  },
  2: {
    id: 2,
    name: '房东的猫-云烟成雨',
    desc: '房东的猫livehouse合集',
    priority: 10,
    cdn: SwitchEnum.yes,
    type: LiveRoomTypeEnum.system,
    area: [1],
    devFFmpeg: false, // 初始化ffmpeg
    prodFFmpeg: true, // 初始化ffmpeg
    devFFmpegLocalFile: path.resolve(VIDEO_DIR, 'fddm_snjs.mp4'),
    prodFFmpegLocalFile: path.resolve(SERVER_VIDEO_DIR, 'fddm_yycy.mp4'),
  },
  3: {
    id: 3,
    name: '房东的猫-和宇宙的温柔关联',
    desc: '房东的猫livehouse合集',
    priority: 3,
    cdn: SwitchEnum.no,
    type: LiveRoomTypeEnum.system,
    area: [1],
    devFFmpeg: true, // 初始化ffmpeg
    prodFFmpeg: true, // 初始化ffmpeg
    devFFmpegLocalFile: path.resolve(VIDEO_DIR, 'fddm_hyzdwmgl.mp4'),
    prodFFmpegLocalFile: path.resolve(SERVER_VIDEO_DIR, 'fddm_hyzdwmgl.mp4'),
  },
  4: {
    id: 4,
    name: '房东的猫-少年锦时',
    desc: '房东的猫livehouse合集',
    priority: 20,
    cdn: SwitchEnum.no,
    type: LiveRoomTypeEnum.system,
    area: [1],
    devFFmpeg: true, // 初始化ffmpeg
    prodFFmpeg: true, // 初始化ffmpeg
    devFFmpegLocalFile: path.resolve(VIDEO_DIR, 'fddm_snjs.mp4'),
    prodFFmpegLocalFile: path.resolve(SERVER_VIDEO_DIR, 'fddm_snjs.mp4'),
  },
  5: {
    id: 5,
    name: '房东的猫-下一站茶山刘',
    desc: '房东的猫livehouse合集',
    priority: 2,
    cdn: SwitchEnum.no,
    type: LiveRoomTypeEnum.system,
    area: [1],
    devFFmpeg: true, // 初始化ffmpeg
    prodFFmpeg: true, // 初始化ffmpeg
    devFFmpegLocalFile: path.resolve(VIDEO_DIR, 'fddm_xyzcsl.mp4'),
    prodFFmpegLocalFile: path.resolve(SERVER_VIDEO_DIR, 'fddm_xyzcsl.mp4'),
  },
  6: {
    id: 6,
    name: '房东的猫-你是我为数不多的骄傲',
    desc: '房东的猫livehouse合集',
    priority: 2,
    cdn: SwitchEnum.no,
    type: LiveRoomTypeEnum.system,
    area: [1],
    devFFmpeg: false, // 初始化ffmpeg
    prodFFmpeg: true, // 初始化ffmpeg
    devFFmpegLocalFile: path.resolve(VIDEO_DIR, 'fddm_xyzcsl.mp4'),
    prodFFmpegLocalFile: path.resolve(SERVER_VIDEO_DIR, 'fddm_nswwsbddja.mp4'),
  },
  7: {
    id: 7,
    name: '周杰伦-不能说的秘密',
    desc: '周杰伦演唱会合集',
    priority: 2,
    cdn: SwitchEnum.no,
    type: LiveRoomTypeEnum.system,
    area: [1],
    devFFmpeg: false, // 初始化ffmpeg
    prodFFmpeg: true, // 初始化ffmpeg
    devFFmpegLocalFile: path.resolve(VIDEO_DIR, 'fddm_xyzcsl.mp4'),
    prodFFmpegLocalFile: path.resolve(SERVER_VIDEO_DIR, 'zjl_bnsdmm.mp4'),
  },
  8: {
    id: 8,
    name: '周杰伦-晴天',
    desc: '周杰伦演唱会合集',
    priority: 2,
    cdn: SwitchEnum.no,
    type: LiveRoomTypeEnum.system,
    area: [1],
    devFFmpeg: false, // 初始化ffmpeg
    prodFFmpeg: false, // 初始化ffmpeg
    devFFmpegLocalFile: path.resolve(VIDEO_DIR, 'fddm_xyzcsl.mp4'),
    prodFFmpegLocalFile: path.resolve(SERVER_VIDEO_DIR, 'zjl_qt.mp4'),
  },
  9: {
    id: 9,
    name: '房东的猫-一次就好',
    desc: '房东的猫livehouse合集',
    priority: 2,
    cdn: SwitchEnum.no,
    type: LiveRoomTypeEnum.system,
    area: [1],
    devFFmpeg: false, // 初始化ffmpeg
    prodFFmpeg: true, // 初始化ffmpeg
    devFFmpegLocalFile: path.resolve(VIDEO_DIR, 'fddm_xyzcsl.mp4'),
    prodFFmpegLocalFile: path.resolve(SERVER_VIDEO_DIR, 'fddm_ycjh.mp4'),
  },
  10: {
    id: 10,
    name: '七龙珠-渐渐被你吸引',
    desc: '龙珠系列合集',
    priority: 2,
    cdn: SwitchEnum.no,
    type: LiveRoomTypeEnum.system,
    area: [1],
    devFFmpeg: false, // 初始化ffmpeg
    prodFFmpeg: true, // 初始化ffmpeg
    devFFmpegLocalFile: path.resolve(VIDEO_DIR, 'fddm_xyzcsl.mp4'),
    prodFFmpegLocalFile: path.resolve(SERVER_VIDEO_DIR, 'qlz_jjbnxy.mp4'),
  },
  11: {
    id: 11,
    name: '周杰伦-搁浅',
    desc: '周杰伦演唱会合集',
    priority: 2,
    cdn: SwitchEnum.no,
    type: LiveRoomTypeEnum.system,
    area: [1],
    devFFmpeg: false, // 初始化ffmpeg
    prodFFmpeg: false, // 初始化ffmpeg
    devFFmpegLocalFile: path.resolve(VIDEO_DIR, 'fddm_xyzcsl.mp4'),
    prodFFmpegLocalFile: path.resolve(SERVER_VIDEO_DIR, 'zjl_gq.mp4'),
  },
  12: {
    id: 12,
    name: 'billd-live付费课',
    desc: '从零搭建一个开源直播间系列',
    priority: 10,
    cdn: SwitchEnum.no,
    type: LiveRoomTypeEnum.system,
    area: [1],
    devFFmpeg: false, // 初始化ffmpeg
    prodFFmpeg: true, // 初始化ffmpeg
    devFFmpegLocalFile: path.resolve(VIDEO_DIR, 'fddm_xyzcsl.mp4'),
    prodFFmpegLocalFile: path.resolve(
      SERVER_VIDEO_DIR,
      'hss_20230707_1_30.mp4'
    ),
  },
  13: {
    id: 13,
    name: '哔哩哔哩直播间',
    desc: '转播哔哩哔哩直播间',
    priority: 10,
    cdn: SwitchEnum.no,
    type: LiveRoomTypeEnum.system,
    area: [1],
    devFFmpeg: false, // 初始化ffmpeg
    prodFFmpeg: false, // 初始化ffmpeg
    devFFmpegLocalFile: path.resolve(VIDEO_DIR, ''),
    prodFFmpegLocalFile: path.resolve(SERVER_VIDEO_DIR, ''),
  },
  9999: {
    id: 9999,
    name: '周杰伦-一路向北',
    desc: '周杰伦演唱会合集',
    priority: 2,
    cdn: SwitchEnum.no,
    type: LiveRoomTypeEnum.system,
    area: [1],
    devFFmpeg: false, // 初始化ffmpeg
    prodFFmpeg: false, // 初始化ffmpeg
    devFFmpegLocalFile: path.resolve(VIDEO_DIR, 'fddm_xyzcsl.mp4'),
    prodFFmpegLocalFile: path.resolve(SERVER_VIDEO_DIR, 'zjl_ylxb.mp4'),
  },
};

export const initUser = {
  admin1: {
    id: 1,
    username: 'admin1',
    password: '123456',
    avatar: '',
    user_roles: [DEFAULT_ROLE_INFO.SUPER_ADMIN.id],
    live_room: initLiveRoom[1],
  },
  admin2: {
    id: 2,
    username: 'admin2',
    password: '123456',
    user_roles: [DEFAULT_ROLE_INFO.SUPER_ADMIN.id],
    avatar: '',
    live_room: initLiveRoom[2],
  },
  admin3: {
    id: 3,
    username: 'admin3',
    password: '123456',
    avatar: '',
    user_roles: [DEFAULT_ROLE_INFO.SUPER_ADMIN.id],
    live_room: initLiveRoom[3],
  },
  live_admin1: {
    id: 4,
    username: 'live_admin1',
    password: '123456',
    avatar: '',
    user_roles: [DEFAULT_ROLE_INFO.LIVE_ADMIN.id],
    live_room: initLiveRoom[4],
  },
  live_admin2: {
    id: 5,
    username: 'live_admin2',
    password: '123456',
    avatar: '',
    user_roles: [DEFAULT_ROLE_INFO.LIVE_ADMIN.id],
    live_room: initLiveRoom[5],
  },
  live_admin3: {
    id: 6,
    username: 'live_admin3',
    password: '123456',
    avatar: '',
    user_roles: [DEFAULT_ROLE_INFO.LIVE_ADMIN.id],
    live_room: initLiveRoom[6],
  },
  vip_user1: {
    id: 7,
    username: 'vip_user1',
    password: '123456',
    avatar: '',
    user_roles: [DEFAULT_ROLE_INFO.VIP_USER.id],
    live_room: initLiveRoom[7],
  },
  vip_user2: {
    id: 8,
    username: 'vip_user2',
    password: '123456',
    avatar: '',
    user_roles: [DEFAULT_ROLE_INFO.VIP_USER.id],
    live_room: initLiveRoom[8],
  },
  vip_user3: {
    id: 9,
    username: 'vip_user3',
    password: '123456',
    avatar: '',
    user_roles: [DEFAULT_ROLE_INFO.VIP_USER.id],
    live_room: initLiveRoom[9],
  },
  svip_user1: {
    id: 10,
    username: 'svip_user1',
    password: '123456',
    avatar: '',
    user_roles: [DEFAULT_ROLE_INFO.SVIP_USER.id],
    live_room: initLiveRoom[10],
  },
  svip_user2: {
    id: 11,
    username: 'svip_user2',
    password: '123456',
    avatar: '',
    user_roles: [DEFAULT_ROLE_INFO.SVIP_USER.id],
    live_room: initLiveRoom[11],
  },
  svip_user3: {
    id: 12,
    username: 'svip_user3',
    password: '123456',
    avatar: '',
    user_roles: [DEFAULT_ROLE_INFO.SVIP_USER.id],
    live_room: initLiveRoom[12],
  },
  tourist1: {
    id: 13,
    username: 'tourist1',
    password: '123456',
    avatar: '',
    user_roles: [DEFAULT_ROLE_INFO.TOURIST_USER.id],
  },
  tourist2: {
    id: 14,
    username: 'tourist2',
    password: '123456',
    avatar: '',
    user_roles: [DEFAULT_ROLE_INFO.TOURIST_USER.id],
  },
  tourist3: {
    id: 15,
    username: 'tourist3',
    password: '123456',
    avatar: '',
    user_roles: [DEFAULT_ROLE_INFO.TOURIST_USER.id],
  },
  user_bilibili: {
    id: 16,
    username: 'user_bilibili',
    password: '123456',
    avatar: '',
    user_roles: [DEFAULT_ROLE_INFO.VIP_USER.id],
    live_room: initLiveRoom[13],
  },
  user_9999: {
    id: 9999,
    username: 'user_9999',
    password: '123456',
    avatar: '',
    user_roles: [DEFAULT_ROLE_INFO.VIP_USER.id],
    live_room: initLiveRoom[9999],
  },
};
