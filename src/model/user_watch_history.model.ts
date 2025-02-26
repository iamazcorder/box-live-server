import sequelize from '@/config/mysql';
import { initTable } from '@/init/initDb';
import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

interface UserWatchHistoryModel
  extends Model<
    InferAttributes<UserWatchHistoryModel>,
    InferCreationAttributes<UserWatchHistoryModel>
  > {
  id: number;
  user_id: number;
  live_room_id: number;
  watched_at: Date;
  content_type: 'live' | 'replay';
  live_replay_id: number | null;
  created_at: Date;
  updated_at: Date;
}

const model = sequelize.define<UserWatchHistoryModel>(
  'user_watch_history',
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
    watched_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    content_type: {
      type: DataTypes.ENUM('live', 'replay'),
      allowNull: false,
    },
    live_replay_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      onUpdate: 'CURRENT_TIMESTAMP',
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
