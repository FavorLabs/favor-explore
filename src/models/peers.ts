import ModelsType, { Models } from '@/declare/modelType';
import { Peers, BlockList } from '@/declare/api';
import DebugApi from '@/api/debugApi';
import { message } from 'antd';

export interface State {
  peers: Peers;
  blockList: BlockList;
}

export default {
  state: {
    peers: [],
    blockList: [],
  },
  reducers: {
    setPeers(state, { payload }) {
      const { peers } = payload;
      return {
        ...state,
        peers,
      };
    },
    setBlockList(state, { payload }) {
      const { blockList } = payload;
      return {
        ...state,
        blockList,
      };
    },
  },
  effects: {
    *getPeers({ payload }, { call, put }) {
      const { url } = payload;
      try {
        const { data } = yield call(DebugApi.getPeers, url);
        yield put({
          type: 'setPeers',
          payload: {
            peers: data.peers,
          },
        });
      } catch (err) {
        if (err instanceof Error) message.info(err.message);
      }
    },
    *getBlockList({ payload }, { call, put }) {
      const { url } = payload;
      try {
        const { data } = yield call(DebugApi.getBlockList, url);
        yield put({
          type: 'setBlockList',
          payload: {
            blockList: data.peers || [],
          },
        });
      } catch (err) {
        if (err instanceof Error) message.info(err.message);
      }
    },
    *addBlock({ payload }, { call, put, select }) {
      const { address } = payload;
      const { debugApi } = yield select((state: Models) => state.global);
      try {
        const { data } = yield call(DebugApi.addBlock, debugApi, address);
        yield put({
          type: 'getPeers',
          payload: {
            url: debugApi,
          },
        });
        yield put({
          type: 'getBlockList',
          payload: {
            url: debugApi,
          },
        });
      } catch (err) {
        if (err instanceof Error) message.info(err.message);
      }
    },
    *deleteBlock({ payload }, { call, put, select }) {
      const { address } = payload;
      const { debugApi } = yield select((state: Models) => state.global);
      try {
        const { data } = yield call(DebugApi.deleteBlock, debugApi, address);
        yield put({
          type: 'getPeers',
          payload: {
            url: debugApi,
          },
        });
        yield put({
          type: 'getBlockList',
          payload: {
            url: debugApi,
          },
        });
      } catch (err) {
        if (err instanceof Error) message.info(err.message);
      }
    },
  },
  subscriptions: {},
} as ModelsType<State>;
