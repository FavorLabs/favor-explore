import axios, { Canceler } from 'axios';
import NProgress from 'nprogress';
import { eventEmitter } from '@/utils/util';

const request = axios.create({
  baseURL: '',
  timeout: 5e3,
});

let requestIndex: number = 0;
let responseIndex: number = 0;

let pending: Record<string, Canceler> = {};

const removeAllPendingRequestsRecord = (): void => {
  Object.values(pending).forEach((func) => {
    func();
  });
  pending = {};
};

const removePending = (key: string, isRequest = false): void => {
  if (pending[key] && isRequest) {
    pending[key]();
  }
  delete pending[key];
};

export const getConfirmation = (mes = '', callback = () => {}): void => {
  removeAllPendingRequestsRecord();
  callback();
};
export const cancelProgressArr = ['/metrics'];

export const cancelProgress = (uri: string): boolean => {
  const url = new URL(uri);
  return cancelProgressArr.some((item) => item === url.pathname);
};

request.interceptors.request.use(
  (config) => {
    let reqData: string = '';

    if (config.method === 'get') {
      reqData = config.url + config.method + JSON.stringify(config.params);
    } else {
      reqData =
        (config.url as string) + config.method + JSON.stringify(config.data);
    }

    removePending(reqData, true);

    config.cancelToken = new axios.CancelToken((c) => {
      pending[reqData] = c;
    });

    if (config.url && !cancelProgress(config.url)) {
      requestIndex++;
      NProgress.start();
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

request.interceptors.response.use(
  (response) => {
    if (response.config.url && !cancelProgress(response.config.url)) {
      responseIndex++;
      if (responseIndex === requestIndex) {
        NProgress.done();
      }
    }
    return response;
  },
  (error) => {
    responseIndex++;
    if (responseIndex === requestIndex) {
      NProgress.done();
    }
    if (axios.isCancel(error)) {
      return new Promise(() => {});
    }
    if (error.message === 'Network Error') {
      eventEmitter.emit('404');
      return Promise.reject(new Error('Failed'));
    }
    return Promise.reject(error.response?.data ? error.response.data : error);
  },
);

export default request;
