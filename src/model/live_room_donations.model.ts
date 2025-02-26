import sequelize from '@/config/mysql';
import { initTable } from '@/init/initDb';
import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

interface LiveRoomDonationModel
  extends Model<
    InferAttributes<LiveRoomDonationModel>,
    InferCreationAttributes<LiveRoomDonationModel>
  > {
  id: number;
  room_id: number;
  user_id: number;
  gift_id: number;
  gift_count: number;
  created_at: Date;
}

const model = sequelize.define<LiveRoomDonationModel>(
  'live_room_donations',
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
    gift_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    gift_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
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
