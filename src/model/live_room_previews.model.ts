import sequelize from '@/config/mysql';
import { initTable } from '@/init/initDb';
import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';
import liveRoomAppointmentModel from './live_room_appointments.model';

export interface IPreview {
  id?: number;
  user_id?: number;
  title?: string;
  preview_date?: Date;
  cover_image?: string;
  created_at?: Date;
  updated_at?: Date;
}

interface LiveRoomPreviewModel
  extends Model<
      InferAttributes<LiveRoomPreviewModel>,
      InferCreationAttributes<LiveRoomPreviewModel>
    >,
    IPreview {}

const model = sequelize.define<LiveRoomPreviewModel>(
  'live_room_previews',
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
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    preview_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    cover_image: {
      type: DataTypes.STRING(255),
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

// 定义反向关联
// model.hasMany(liveRoomAppointmentModel, {
//   foreignKey: 'preview_id',
//   as: 'appointments', // 给反向关联起一个别名 'appointments'
// });

initTable({ model, sequelize });

export default model;
