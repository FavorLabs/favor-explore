import ModelsType, { Models } from '@/declare/modelType';
import { defaultApi, sessionStorageApi } from '@/config/url';
import { checkSession, initChartData, getEndPoint } from '@/utils/util';
import { message } from 'antd';
import { Topology, ApiPort, Application } from '@/declare/api';
import Api from '@/api/api';
import DebugApi from '@/api/debugApi';
import { getConfirmation } from '@/utils/request';
import semver from 'semver';
import { favorVersion } from '@/config/version';
import { speedTime } from '@/config/url';
import moment from 'moment';
import { splitUrl } from '@/utils/util';
import { WebsocketProvider } from 'web3-core';
import EventEmitter from 'eventemitter3';
import { eventEmitter } from '@/utils/util';
import { defaultTheme } from '@/config/themeConfig';

export type WebsocketType = WebsocketProvider & EventEmitter & { DATA: string };

export type ErrorType = 'apiError' | 'versionError';

export type ChartData = {
  time: string;
  category: 'retrieved' | 'transferred';
  speed: number;
};

export declare type themeType = 'dark' | 'light';

export interface State {
  status: boolean;
  api: string;
  debugApi: string;
  wsApi: string;
  ws: null | WebsocketType;
  refresh: boolean;
  health: {
    status?: string;
    version?: string;
    fullNode?: boolean;
    bootNodeMode?: boolean;
  };
  topology: Topology;
  metrics: {
    downloadTotal: number;
    uploadTotal: number;
    retrievalDownload: number;
    retrievalUpload: number;
    chunkInfoDownload: number;
    chunkInfoUpload: number;
    downloadSpeed: number;
    uploadSpeed: number;
  };
  chartData: ChartData[];
  electron: boolean;
  logoTheme: themeType;
  application: Application[];
}

export default {
  state: {
    refresh: false,
    status: false,
    api: checkSession(sessionStorageApi) || getEndPoint() || defaultApi,
    debugApi: '',
    wsApi: '',
    ws: null,
    health: {},
    topology: {},
    metrics: {
      downloadTotal: 0,
      uploadTotal: 0,
      retrievalDownload: 0,
      retrievalUpload: 0,
      chunkInfoDownload: 0,
      chunkInfoUpload: 0,
      downloadSpeed: 0,
      uploadSpeed: 0,
    },
    isInitMetrics: true,
    chartData: [],
    electron:
      window.navigator.userAgent.toLowerCase().indexOf('electron') !== -1,
    logoTheme: defaultTheme,
    application: [],
  },
  reducers: {
    setApi(state, { payload }) {
      const { api, debugApi, wsApi } = payload;
      return {
        ...state,
        api,
        debugApi,
        wsApi,
      };
    },
    setStatus(state, { payload }) {
      const { status } = payload;
      return {
        ...state,
        status,
      };
    },
    setRefresh(state, { payload }) {
      const { refresh } = payload;
      return {
        ...state,
        refresh,
      };
    },
    setHealth(state, { payload }) {
      const { health } = payload;
      return {
        ...state,
        health,
      };
    },
    setTopology(state, { payload }) {
      const { topology } = payload;
      return {
        ...state,
        topology,
      };
    },
    setMetrics(state, { payload }) {
      const { metrics } = payload;
      return {
        ...state,
        metrics,
      };
    },
    setSpeed(state, { payload }) {
      const { speed } = payload;
      return {
        ...state,
        speed,
      };
    },
    setChartData(state, { payload }) {
      const { chartData } = payload;
      return {
        ...state,
        chartData,
      };
    },
    initMetrics(state) {
      return {
        ...state,
        metrics: {
          downloadTotal: 0,
          uploadTotal: 0,
          retrievalDownload: 0,
          retrievalUpload: 0,
          chunkInfoDownload: 0,
          chunkInfoUpload: 0,
          downloadSpeed: 0,
          uploadSpeed: 0,
        },
        chartData: [],
      };
    },
    setWs(state, { payload }) {
      let { ws } = payload;
      return {
        ...state,
        ws,
      };
    },
    resetTotal(state, { payload }) {
      const { metrics } = payload;
      return {
        ...state,
        metrics,
      };
    },
    setLogoTheme(state, { payload }) {
      const { logoTheme } = payload;
      return {
        ...state,
        logoTheme,
      };
    },
    setApplication(state, { payload }) {
      const { application } = payload;
      return {
        ...state,
        application,
      };
    },
  },
  effects: {
    *getStatus({ payload }, { call, put }) {
      const { api } = payload;
      try {
        const apiPort = yield call(Api.getPort, api);
        let { debugApiPort, rpcWsPort }: ApiPort = apiPort.data;
        if (!debugApiPort || !rpcWsPort)
          throw new Error('debugApi or ws is not enabled');

        let [protocol, hostname] = splitUrl(api);
        let debugApi = `${protocol}//${hostname}:${debugApiPort}`;
        let wsApi = `${
          protocol === 'http:' ? 'ws' : 'wss'
        }://${hostname}:${rpcWsPort}`;
        yield put({ type: 'setApi', payload: { api, debugApi, wsApi } });

        const health = yield call(DebugApi.getHealth, debugApi);
        const favor = semver.satisfies(
          semver.coerce(health.data.version)?.version as string,
          `>=${favorVersion}`,
        );
        const status = health.data.status === 'ok' && favor;
        yield put({ type: 'setStatus', payload: { status } });
        if (status) {
          message.success('Connection succeeded');
          eventEmitter.emit('changeSettingModal', false);
          yield put({
            type: 'setHealth',
            payload: {
              health: health.data,
            },
          });
        } else if (!favor) {
          throw new Error(
            'Node version is too low, please upgrade to ' + favorVersion,
          );
        }
        return 1;
      } catch (e) {
        if (e instanceof Error) message.info(e.message);
        yield put({
          type: 'setStatus',
          payload: {
            status: false,
          },
        });
      } finally {
        yield put({
          type: 'setRefresh',
          payload: {
            refresh: false,
          },
        });
      }
    },
    *getTopology({ payload }, { call, put }) {
      const { url } = payload;
      try {
        const { data } = yield call(DebugApi.getTopology, url);
        yield put({
          type: 'setTopology',
          payload: {
            topology: data,
          },
        });
      } catch (err) {
        if (err instanceof Error) message.info(err.message);
      }
    },
    *getMetrics({ payload }, { call, put, select }) {
      const { url } = payload;
      try {
        const { data } = yield call(DebugApi.getMetrics, url);
        // const { metrics } = yield select((state: Models) => state.global);
        const retrievalDownload =
          Number(data.match(/\nretrieval_total_retrieved\s(\S*)/)?.[1]) || 0;
        const retrievalUpload =
          Number(data.match(/\nretrieval_total_transferred\s(\S*)/)?.[1]) || 0;
        const chunkInfoDownload =
          Number(data.match(/\nchunkinfo_total_retrieved\s(\S*)/)?.[1]) || 0;
        const chunkInfoUpload =
          Number(data.match(/\nchunkinfo_total_transferred\s(\S*)/)?.[1]) || 0;

        const retrievedTotal = retrievalDownload + chunkInfoDownload;
        const transferredTotal = retrievalUpload + chunkInfoUpload;

        yield put({
          type: 'setMetrics',
          payload: {
            metrics: {
              downloadTotal: retrievedTotal,
              uploadTotal: transferredTotal,
              retrievalDownload,
              retrievalUpload,
              chunkInfoDownload,
              chunkInfoUpload,
              downloadSpeed: 0,
              uploadSpeed: 0,
            },
          },
        });
        yield put({
          type: 'setChartData',
          payload: {
            chartData: initChartData(120, speedTime),
          },
        });
      } catch (e) {
        console.log(e);
      }
    },
    *updateChunkOrRetrieval({ payload }, { call, put, select }) {
      const { metrics } = yield select((state: Models) => state.global);
      console.log(payload);
      yield put({
        type: 'setMetrics',
        payload: {
          metrics: {
            ...metrics,
            ...payload,
          },
        },
      });
    },
    *updateChart({ payload }, { call, put, select }) {
      const { metrics, chartData } = yield select(
        (state: Models) => state.global,
      );

      const downloadTotal =
        metrics.retrievalDownload + metrics.chunkInfoDownload;
      const uploadTotal = metrics.retrievalUpload + metrics.chunkInfoUpload;
      const downloadSpeed = downloadTotal - metrics.downloadTotal;
      const uploadSpeed = uploadTotal - metrics.uploadTotal;

      // const random_downloadSpeed = Math.floor(Math.random() * 1000);
      // const random_uploadSpeed = Math.floor(Math.random() * 1000);

      yield put({
        type: 'setMetrics',
        payload: {
          metrics: {
            ...metrics,
            downloadTotal,
            uploadTotal,
            downloadSpeed: downloadSpeed,
            uploadSpeed: uploadSpeed,
            // downloadSpeed: random_downloadSpeed,
            // uploadSpeed: random_uploadSpeed,
          },
        },
      });
      yield put({
        type: 'setChartData',
        payload: {
          chartData: chartData
            .concat([
              {
                time: moment().utcOffset(480).format('HH.mm.ss'),
                category: 'retrieved',
                speed: (downloadSpeed * 256) / 1024 / (speedTime / 1000),
              },
              {
                time: moment().utcOffset(480).format('HH.mm.ss'),
                category: 'transferred',
                speed: (uploadSpeed * 256) / 1024 / (speedTime / 1000),
              },
              // {
              //   time: moment().utcOffset(480).format('HH.mm.ss'),
              //   category: 'retrieved',
              //   speed: (random_downloadSpeed * 256) / 1024 / (speedTime / 1000),
              // },
              // {
              //   time: moment().utcOffset(480).format('HH.mm.ss'),
              //   category: 'transferred',
              //   speed: (random_uploadSpeed * 256) / 1024 / (speedTime / 1000),
              // },
            ])
            .slice(2),
        },
      });
    },
    *getApplication({ payload }, { call, put }) {
      const { url } = payload;
      try {
        const { data } = yield call(Api.getApplication, url);
        yield put({
          type: 'setApplication',
          payload: {
            application: data,
          },
        });
      } catch (err) {
        if (err instanceof Error) message.info(err.message);
      }
    },
  },
  subscriptions: {
    setup({ history }) {
      return history.listen(() => {
        getConfirmation();
      });
    },
  },
} as ModelsType<State>;
