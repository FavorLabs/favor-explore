import request from '@/utils/request';
import { AxiosResponse } from 'axios';

const baseUrl = 'https://service.favorlabs.io/api/v1';

export const getMap = (params: object): Promise<AxiosResponse> => {
  return request({
    url: `${baseUrl}/map`,
    params,
    timeout: 0,
  });
};

export const getApplication = (
  networkId: number,
): Promise<AxiosResponse<any>> => {
  return request({
    url: `${baseUrl}/application`,
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
