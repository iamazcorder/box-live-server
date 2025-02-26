import sequelize from '@/config/mysql';
import { initTable } from '@/init/initDb';
import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

interface LiveRoomViewerModel
  extends Model<
    InferAttributes<LiveRoomViewerModel>,
    InferCreationAttributes<LiveRoomViewerModel>
  > {
  id: number;
  room_id: number;
  user_id: number;
  joined_at: Date;
  left_at: Date | null;
}

const model = sequelize.define<LiveRoomViewerModel>(
  'live_room_viewers',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    room_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    joined_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    left_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    paranoid: true,
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

initTable({ model, sequelize });

export default model;
