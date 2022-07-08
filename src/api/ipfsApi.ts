import request from '@/utils/request';
import { AxiosResponse } from 'axios';
import { query } from '@/utils/util';

export type IPFS_LS = {
  Objects: {
    hash: string;
    Links: [];
  }[];
};

export const getInfo = (hash: string): Promise<AxiosResponse<IPFS_LS>> => {
  return request({
    url: 'https://ipfs.io/api/v0/ls/' + hash,
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
