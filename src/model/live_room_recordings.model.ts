import sequelize from '@/config/mysql';
import { initTable } from '@/init/initDb';
import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

export interface IRecording {
  id?: number;
  live_room_id?: number;
  parent_category_id?: number;
  child_category_id?: number;
  title?: string;
  url?: string;
  duration?: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

interface LiveRoomRecordingModel
  extends Model<
      InferAttributes<LiveRoomRecordingModel>,
      InferCreationAttributes<LiveRoomRecordingModel>
    >,
    IRecording {}

const model = sequelize.define<LiveRoomRecordingModel>(
  'live_room_recordings',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    live_room_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    parent_category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    child_category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
