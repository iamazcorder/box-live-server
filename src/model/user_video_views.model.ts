import sequelize from '@/config/mysql';
import { initTable } from '@/init/initDb';
import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

export interface IVideoView {
  id?: number;
  user_id?: number;
  video_id?: number;
  duration?: number;
  is_finished?: number;
  watched_at?: Date;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

interface UserVideoViewsModel
  extends Model<
      InferAttributes<UserVideoViewsModel>,
      InferCreationAttributes<UserVideoViewsModel>
    >,
    IVideoView {}

const model = sequelize.define<UserVideoViewsModel>(
  'user_video_views',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    video_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    is_finished: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    watched_at: {
      type: DataTypes.DATE,
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
