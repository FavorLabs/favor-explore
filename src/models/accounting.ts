import ModelsType, { Models } from '@/declare/modelType';
import { Cheque, TrafficInfo } from '@/declare/api';
import { getTrafficInfo, getTrafficCheques, cashOut } from '@/api/api';
import { message } from 'antd';
import { ethers } from 'ethers';

export interface State {
  account: string;
  trafficInfo: TrafficInfo;
  trafficCheques: Cheque[];
  cashOutList: Cheque[];
}

export default {
  state: {
    account: '',
    trafficInfo: {
      balance: 0,
      availableBalance: 0,
      totalSendTraffic: 0,
      receivedTraffic: 0,
    },
    trafficCheques: [],
    cashOutList: [],
  },
  reducers: {
    setAccount(state, { payload }) {
      const { account } = payload;
      return {
        ...state,
        account,
      };
    },
    setTrafficInfo(state, { payload }) {
      const { trafficInfo } = payload;
      return {
        ...state,
        trafficInfo,
      };
    },
    setTrafficCheques(state, { payload }) {
      const { trafficCheques } = payload;
      return {
        ...state,
        trafficCheques,
      };
    },
    setCashOutList(state, { payload }) {
      const { cashOutList } = payload;
      return {
        ...state,
        cashOutList,
      };
    },
  },
  effects: {
    *setSingleCashLoad({ payload }, { put, select }) {
      const { index, status } = payload;
      const { trafficCheques } = yield select(
        (state: Models) => state.accounting,
      );
      let tem = JSON.parse(JSON.stringify(trafficCheques));
      tem[index].cashLoad = status;
      yield put({
        type: 'setTrafficCheques',
        payload: {
          trafficCheques: tem,
        },
      });
    },
    *resetUnCashed({ payload }, { put, select }) {
      const { index } = payload;
      const { trafficCheques } = yield select(
        (state: Models) => state.accounting,
      );
      let tem = JSON.parse(JSON.stringify(trafficCheques));
      tem[index].unCashed = 0;
      tem[index].cashLoad = false;
      yield put({
        type: 'setTrafficCheques',
        payload: {
          trafficCheques: tem,
        },
      });
    },
  },
  subscriptions: {},
} as ModelsType<State>;
