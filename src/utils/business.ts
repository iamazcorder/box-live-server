import liveRoomController from '@/controller/liveRoom.controller';

/**
 * code：0，鉴权成功；非0代表鉴权错误
 */
export async function liveRoomVerifyAuth({ roomId, publishKey }) {
  if (!roomId) {
    return {
      code: 1,
      msg: '没有roomId',
    };
  }
  if (!publishKey) {
    return {
      code: 1,
      msg: '没有推流key',
    };
  }
  const result = await liveRoomController.common.findKey(Number(roomId));
  const pushKey = result?.key;
  if (pushKey !== publishKey) {
    return {
      code: 1,
      msg: `房间id：${roomId as string}，鉴权失败`,
    };
  }
  return {
    code: 0,
    msg: '鉴权成功',
  };
}
