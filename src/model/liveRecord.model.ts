import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import sequelize from '@/config/mysql';
import { initTable } from '@/init/initDb';
import { ILiveRecord, LivePlatformEnum } from '@/interface';

interface LiveRecordModel
  extends Model<
      InferAttributes<LiveRecordModel>,
      InferCreationAttributes<LiveRecordModel>
    >,
    ILiveRecord {}

const model = sequelize.define<LiveRecordModel>(
  'live_record',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    live_room_id: {
      type: DataTypes.INTEGER,
    },
    user_id: {
      type: DataTypes.INTEGER,
    },
    platform: {
      type: DataTypes.INTEGER,
      defaultValue: LivePlatformEnum.tencentcloud_css,
    },
    stream_name: {
      type: DataTypes.STRING(300),
      defaultValue: '',
    },
    stream_id: {
      type: DataTypes.STRING(100),
      defaultValue: '',
    },
    duration: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    danmu: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    view: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    start_time: {
      type: DataTypes.DATE,
    },
    end_time: {
      type: DataTypes.DATE,
    },
    remark: {
      type: DataTypes.STRING(500),
      defaultValue: '',
    },
  },
  {
    paranoid: true,
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  }
);

initTable({ model, sequelize });

export default model;
