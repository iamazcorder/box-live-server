import sequelize from '@/config/mysql';
import { initTable } from '@/init/initDb';
import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

export interface IVideo {
  id?: number;
  user_id?: number;
  live_room_id?: number;
  parent_category_id?: number;
  child_category_id?: number;
  title?: string;
  cover?: string;
  url?: string;
  duration?: number;
  desc?: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

interface UserVideosModel
  extends Model<
      InferAttributes<UserVideosModel>,
      InferCreationAttributes<UserVideosModel>
    >,
    IVideo {}

const model = sequelize.define<UserVideosModel>(
  'user_videos',
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
    desc: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    cover: {
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
