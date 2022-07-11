import request from '@/utils/request';
import { AxiosResponse } from 'axios';
import { query } from '@/utils/util';

export type IPFS_LS = {
  Objects: {
    hash: string;
    Links: {
      Name: string;
    }[];
  }[];
};

export const getInfo = (
  link: string,
  hash: string,
): Promise<AxiosResponse<IPFS_LS>> => {
  let { origin } = new URL(link);
  return request({
    url: origin + '/api/v0/ls/' + hash,
    timeout: 0,
  });
};

export const ipfsDownload = (
  link: string,
  ft: 'file' | 'tar',
  hash: string,
) => {
  let { origin } = new URL(link);
  let params: Record<string, any> = {};
  if (ft === 'tar') {
    params['archive'] = true;
    link = origin + '/api/v0/get/' + hash;
  }
  return request({
    url: link,
    params,
    responseType: 'blob',
    timeout: 0,
  });
};

export default {};
