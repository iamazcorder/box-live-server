import sequelize from '@/config/mysql';
import { initTable } from '@/init/initDb';
import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

interface LiveRoomRecordingModel
  extends Model<
    InferAttributes<LiveRoomRecordingModel>,
    InferCreationAttributes<LiveRoomRecordingModel>
  > {
  id: number;
  live_room_id: number;
  category_id: number;
  playback_title: string;
  recording_url: string;
  created_at: Date;
  updated_at: Date;
}

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
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    playback_title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    recording_url: {
      type: DataTypes.STRING(255),
      allowNull: false,
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
