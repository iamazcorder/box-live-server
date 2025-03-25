import AreaModel from '@/model/area.model';
import AreaLiveRoomModel from '@/model/areaLiveRoom.model';
import AuthModel from '@/model/auth.model';
import CategoryModel from '@/model/categories.model';
import GlobalMsgModel from '@/model/globalMsg.model';
import LiveModel from '@/model/live.model';
import LiveRecordModel from '@/model/liveRecord.model';
import LiveRoomModel from '@/model/liveRoom.model';
import LiveViewModel from '@/model/liveView.model';
import liveRoomAppointmentsModel from '@/model/live_room_appointments.model';
import liveRoomPreviewsModel from '@/model/live_room_previews.model';
import LiveRoomRecordingModel from '@/model/live_room_recordings.model';
import LogModel from '@/model/log.model';
import LoginRecordModel from '@/model/loginRecord.model';
import OrderModel from '@/model/order.model';
import QqUserModel from '@/model/qqUser.model';
import RoleModel from '@/model/role.model';
import RoleAuthModel from '@/model/roleAuth.model';
import SigninRecordModel from '@/model/signinRecord.model';
import SigninStatisticsModel from '@/model/signinStatistics.model';
import ThirdUserModel from '@/model/thirdUser.model';
import UserModel from '@/model/user.model';
import UserLiveRoomModel from '@/model/userLiveRoom.model';
import UserRoleModel from '@/model/userRole.model';
import UserLiveViewsModel from '@/model/user_live_views.model';
import userVideosModel from '@/model/user_videos.model';
import UserVideoViewsModel from '@/model/user_video_views.model';
import WalletModel from '@/model/wallet.model';
import WechatUserModel from '@/model/wechatUser.model';
import WsMessageModel from '@/model/wsMessage.model';

LiveViewModel.belongsTo(UserModel, {
  foreignKey: 'user_id',
  constraints: false,
});

LoginRecordModel.belongsTo(UserModel, {
  foreignKey: 'user_id',
  constraints: false,
});

GlobalMsgModel.belongsTo(UserModel, {
  foreignKey: 'user_id',
  constraints: false,
});

WsMessageModel.belongsTo(UserModel, {
  foreignKey: 'user_id',
  constraints: false,
});

LiveRoomModel.belongsToMany(AreaModel, {
  foreignKey: 'live_room_id',
  otherKey: 'area_id',
  constraints: false,
  through: {
    model: AreaLiveRoomModel,
    unique: false, // 不生成唯一索引
  },
});

AreaModel.belongsToMany(LiveRoomModel, {
  foreignKey: 'area_id',
  otherKey: 'live_room_id',
  constraints: false,
  through: {
    model: AreaLiveRoomModel,
    unique: false, // 不生成唯一索引
  },
});

AreaModel.hasMany(AreaLiveRoomModel, {
  foreignKey: 'area_id',
  constraints: false,
});

AreaLiveRoomModel.belongsTo(AreaModel, {
  foreignKey: 'live_room_id',
  constraints: false,
});

AreaLiveRoomModel.belongsTo(LiveRoomModel, {
  foreignKey: 'live_room_id',
  constraints: false,
});

// AreaLiveRoomModel.hasMany(LiveRoomModel, {
//   foreignKey: 'id',
//   constraints: false,
//   // as: 'ddd',
// });

LiveRoomModel.belongsToMany(UserModel, {
  foreignKey: 'live_room_id',
  otherKey: 'user_id',
  constraints: false,
  through: {
    model: UserLiveRoomModel,
    unique: false, // 不生成唯一索引
  },
});

UserModel.belongsToMany(LiveRoomModel, {
  foreignKey: 'user_id',
  otherKey: 'live_room_id',
  constraints: false,
  through: {
    model: UserLiveRoomModel,
    unique: false, // 不生成唯一索引
  },
});

SigninStatisticsModel.belongsTo(LiveRoomModel, {
  foreignKey: 'live_room_id',
  constraints: false,
});

SigninRecordModel.belongsTo(LiveRoomModel, {
  foreignKey: 'live_room_id',
  constraints: false,
});

SigninRecordModel.belongsTo(UserModel, {
  foreignKey: 'user_id',
  constraints: false,
});

SigninStatisticsModel.belongsTo(UserModel, {
  foreignKey: 'user_id',
  constraints: false,
});

UserLiveRoomModel.belongsTo(LiveRoomModel, {
  foreignKey: 'live_room_id',
  constraints: false,
});

UserModel.hasOne(WalletModel, {
  foreignKey: 'user_id',
  constraints: false,
});

LiveRecordModel.belongsTo(UserModel, {
  foreignKey: 'user_id',
  constraints: false,
});

LiveModel.belongsTo(LiveRoomModel, {
  foreignKey: 'live_room_id',
  constraints: false,
});

LiveModel.belongsTo(UserModel, {
  foreignKey: 'user_id',
  constraints: false,
});

UserModel.hasOne(LiveModel, {
  foreignKey: 'user_id',
  constraints: false,
});

LiveRecordModel.belongsTo(LiveRoomModel, {
  foreignKey: 'live_room_id',
  constraints: false,
});

LiveRoomModel.hasOne(LiveModel, {
  foreignKey: 'live_room_id',
  constraints: false,
});

LiveRoomModel.hasOne(LiveRecordModel, {
  foreignKey: 'live_room_id',
  constraints: false,
});

WalletModel.belongsTo(UserModel, {
  foreignKey: 'user_id',
  constraints: false,
});

LiveRoomModel.hasOne(UserLiveRoomModel, {
  foreignKey: 'live_room_id',
  constraints: false,
});

UserLiveRoomModel.belongsTo(UserModel, {
  foreignKey: 'user_id',
  constraints: false,
});

RoleModel.belongsToMany(AuthModel, {
  foreignKey: 'role_id',
  otherKey: 'auth_id',
  constraints: false,
  through: {
    model: RoleAuthModel,
    unique: false, // 不生成唯一索引
  },
});

AuthModel.belongsToMany(RoleModel, {
  foreignKey: 'auth_id',
  otherKey: 'role_id',
  constraints: false,
  through: {
    model: RoleAuthModel,
    unique: false, // 不生成唯一索引
  },
});

RoleModel.belongsTo(RoleModel, {
  as: 'p_role',
  foreignKey: 'p_id',
  constraints: false,
});

RoleModel.hasMany(RoleModel, {
  as: 'c_role',
  foreignKey: 'p_id',
  constraints: false,
});

AuthModel.belongsTo(AuthModel, {
  as: 'p_auth',
  foreignKey: 'p_id',
  constraints: false,
});

AuthModel.hasMany(AuthModel, {
  as: 'c_auth',
  foreignKey: 'p_id',
  constraints: false,
});

UserModel.hasMany(OrderModel, {
  foreignKey: 'billd_live_user_id',
  constraints: false,
});
OrderModel.belongsTo(UserModel, {
  foreignKey: 'billd_live_user_id',
  constraints: false,
});

UserModel.hasMany(LogModel, {
  foreignKey: 'user_id',
  constraints: false,
});
LogModel.belongsTo(UserModel, {
  foreignKey: 'user_id',
  constraints: false,
});

ThirdUserModel.belongsTo(UserModel, {
  foreignKey: 'third_user_id',
  constraints: false,
});

QqUserModel.belongsToMany(UserModel, {
  foreignKey: 'third_user_id',
  otherKey: 'user_id',
  sourceKey: 'id',
  constraints: false,
  through: {
    model: ThirdUserModel,
    unique: false, // 不生成唯一索引
  },
});

UserModel.belongsToMany(QqUserModel, {
  foreignKey: 'user_id',
  otherKey: 'third_user_id',
  targetKey: 'id',
  constraints: false,
  through: {
    model: ThirdUserModel,
    unique: false, // 不生成唯一索引
  },
});

WechatUserModel.belongsToMany(UserModel, {
  foreignKey: 'third_user_id',
  otherKey: 'user_id',
  sourceKey: 'id',
  constraints: false,
  through: {
    model: ThirdUserModel,
    unique: false, // 不生成唯一索引
  },
});

UserModel.belongsToMany(WechatUserModel, {
  foreignKey: 'user_id',
  otherKey: 'third_user_id',
  targetKey: 'id',
  constraints: false,
  through: {
    model: ThirdUserModel,
    unique: false, // 不生成唯一索引
  },
});

RoleModel.belongsToMany(UserModel, {
  foreignKey: 'role_id',
  otherKey: 'user_id',
  constraints: false,
  through: {
    model: UserRoleModel,
    unique: false, // 不生成唯一索引
  },
});
UserModel.belongsToMany(RoleModel, {
  foreignKey: 'user_id',
  otherKey: 'role_id',
  constraints: false,
  through: {
    model: UserRoleModel,
    unique: false, // 不生成唯一索引
  },
});

liveRoomAppointmentsModel.belongsTo(liveRoomPreviewsModel, {
  foreignKey: 'preview_id', // 外键是 preview_id
  as: 'preview', // 给关联起一个别名 'preview'
});
liveRoomPreviewsModel.hasMany(liveRoomAppointmentsModel, {
  foreignKey: 'preview_id',
  as: 'appointments', // 给反向关联起一个别名 'appointments'
});

// 在 liveRoomPreviewModel 中定义关联
liveRoomPreviewsModel.belongsTo(UserModel, {
  foreignKey: 'user_id', // 关联的外键
  as: 'user', // 设置别名
});
// 在 userModel 中定义关联
UserModel.hasMany(liveRoomPreviewsModel, {
  foreignKey: 'user_id', // 关联的外键
  as: 'previews', // 设置别名
});
LiveRoomModel.hasMany(LiveRoomRecordingModel, {
  foreignKey: 'live_room_id',
  as: 'recordings', // 别名
});

LiveRoomRecordingModel.belongsTo(LiveRoomModel, {
  foreignKey: 'live_room_id',
  as: 'liveRoom', // 这里的 as 必须与查询时的 model 名一致
});
// **1️⃣ 直播回放属于一个父级分类**
LiveRoomRecordingModel.belongsTo(CategoryModel, {
  foreignKey: 'parent_category_id',
  as: 'parentCategory',
});

// **2️⃣ 直播回放属于一个子级分类**
LiveRoomRecordingModel.belongsTo(CategoryModel, {
  foreignKey: 'child_category_id',
  as: 'childCategory',
});

// **3️⃣ 分类可以包含多个直播回放**
CategoryModel.hasMany(LiveRoomRecordingModel, {
  foreignKey: 'parent_category_id',
  as: 'parentRecordings',
});

CategoryModel.hasMany(LiveRoomRecordingModel, {
  foreignKey: 'child_category_id',
  as: 'childRecordings',
});

// 添加关联（一个用户可以有多个视频）
UserModel.hasMany(userVideosModel, { foreignKey: 'user_id', as: 'videos' });
userVideosModel.belongsTo(UserModel, { foreignKey: 'user_id', as: 'user' });

// 关联 LiveRoom
userVideosModel.belongsTo(LiveRoomModel, {
  foreignKey: 'live_room_id',
  as: 'liveRoom',
});

// 关联 Categories
userVideosModel.belongsTo(CategoryModel, {
  foreignKey: 'parent_category_id',
  as: 'parentCategory',
});
userVideosModel.belongsTo(CategoryModel, {
  foreignKey: 'child_category_id',
  as: 'childCategory',
});

UserModel.hasMany(UserVideoViewsModel, {
  foreignKey: 'user_id',
  as: 'videoViews', // 关联名，之后 include 查询要用
});

UserVideoViewsModel.belongsTo(UserModel, {
  foreignKey: 'user_id',
  as: 'user',
});

// `user_videos` 关联 `user_video_views`
userVideosModel.hasMany(UserVideoViewsModel, {
  foreignKey: 'video_id',
  as: 'videoViews', // 之后 `include` 查询时用这个名字
});

UserVideoViewsModel.belongsTo(userVideosModel, {
  foreignKey: 'video_id',
  as: 'video',
});

UserLiveViewsModel.belongsTo(UserModel, {
  foreignKey: 'user_id',
  as: 'user', // **确保别名与 service 里 include 里的 as 一致**
});

UserLiveViewsModel.belongsTo(LiveRoomModel, {
  foreignKey: 'live_room_id',
  as: 'liveRoom',
});

// **建立 liveRoomModel 和 categoriesModel 的关联**
LiveRoomModel.belongsTo(CategoryModel, {
  foreignKey: 'parent_category_id',
  as: 'parentCategory',
});

LiveRoomModel.belongsTo(CategoryModel, {
  foreignKey: 'child_category_id',
  as: 'childCategory',
});
