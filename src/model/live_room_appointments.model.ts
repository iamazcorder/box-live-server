import sequelize from '@/config/mysql';
import { initTable } from '@/init/initDb';
import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';
import liveRoomPreviewModel from './live_room_previews.model';

export interface IAppointment {
  id?: number;
  user_id?: number;
  preview_id?: number;
  appointment_time?: Date;
  notification_time?: Date;
  notification_status?: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

interface LiveRoomAppointmentModel
  extends Model<
      InferAttributes<LiveRoomAppointmentModel>,
      InferCreationAttributes<LiveRoomAppointmentModel>
    >,
    IAppointment {}

const model = sequelize.define<LiveRoomAppointmentModel>(
  'live_room_appointments',
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
    preview_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    appointment_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    notification_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    notification_status: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
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

// 定义关联
// model.belongsTo(liveRoomPreviewModel, {
//     foreignKey: 'preview_id', // 外键是 preview_id
//     as: 'preview', // 给关联起一个别名 'preview'
// });

initTable({ model, sequelize });

export default model;
