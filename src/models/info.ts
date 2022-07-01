import ModelsType from '@/declare/modelType';
import { Addresses } from '@/declare/api';
import DebugApi from '@/api/debugApi';
import { message } from 'antd';

export interface State {
  addresses?: Addresses;
}

export default {
  state: {
    addresses: {},
  },
  reducers: {
    setAddresses(state, { payload }) {
      const { addresses } = payload;
      return {
        ...state,
        addresses,
      };
    },
  },
  effects: {
    *getAddresses({ payload }, { call, put }) {
      const { url } = payload;
      try {
        const { data } = yield call(DebugApi.getAddresses, url);
        yield put({
          type: 'setAddresses',
          payload: {
            addresses: data,
          },
        });
      } catch (err) {
        if (err instanceof Error) message.info(err.message);
      }
    },
  },
  subscriptions: {},
} as ModelsType<State>;
