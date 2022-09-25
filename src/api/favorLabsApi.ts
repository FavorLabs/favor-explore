import request from '@/utils/request';
import { AxiosResponse } from 'axios';

export const baseURL = 'https://service.favorlabs.io/api/v1';

export const getMap = (params: object): Promise<AxiosResponse> => {
  return request({
    baseURL,
    url: `${baseURL}/map`,
    params,
    timeout: 0,
  });
};

export const getApplication = (
  networkId: number,
): Promise<AxiosResponse<any>> => {
  return request({
    baseURL,
    url: `${baseURL}/application`,
    params: {
      networkId,
    },
    timeout: 0,
  });
};

export default {
  getMap,
  getApplication,
};
