// src/model/liveAnchorAudit.model.ts
import sequelize from '@/config/mysql';
import { initTable } from '@/init/initDb';
import { DataTypes, Model } from 'sequelize';
import adminUserModel from './adminUser.model';
import userModel from './user.model';

interface LiveAnchorAuditModel extends Model {
  id: number;
  user_id: number;
  id_number: string;
  real_name: string;
  status: number;
  reject_reason: string | null;
  audit_admin_id: number | null;
  audit_time: Date | null;
}

const model = sequelize.define<LiveAnchorAuditModel>(
  'live_anchor_audit',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
      comment: '审核ID',
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '申请人ID',
      references: {
        model: userModel,
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    id_number: {
      type: DataTypes.STRING(18),
      allowNull: false,
      comment: '身份证号',
    },
    real_name: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '真实姓名',
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      comment: '状态：0-待审核 1-已通过 2-已拒绝',
    },
    reject_reason: {
      type: DataTypes.STRING(255),
      comment: '拒绝原因',
    },
    audit_admin_id: {
      type: DataTypes.INTEGER,
      comment: '审核人ID',
      references: {
        model: adminUserModel,
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
    audit_time: {
      type: DataTypes.DATE,
      comment: '审核时间',
    },
  },
  {
    paranoid: false,
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: false,
    comment: '主播申请审核表',
    indexes: [
      {
        name: 'idx_user_id',
        fields: ['user_id'],
      },
      {
        name: 'idx_status',
        fields: ['status'],
      },
    ],
  }
);

// 定义关联关系
model.belongsTo(userModel, {
  foreignKey: 'user_id',
  as: 'applicant',
});

model.belongsTo(adminUserModel, {
  foreignKey: 'audit_admin_id',
  as: 'audit_admin',
});

initTable({ model, sequelize });

export default model;
