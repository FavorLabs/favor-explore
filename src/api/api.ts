import request from '@/utils/request';
import { AxiosResponse, AxiosRequestConfig } from 'axios';
import {
  FileType,
  FileAttr,
  TrafficInfo,
  Cheque,
  ApiPort,
} from '@/declare/api';
import { encodeUnicode } from '@/utils/util';

export const isConnected = (url: string): Promise<AxiosResponse<string>> => {
  return request({
    url,
  });
};

export const getPort = (url: string): Promise<AxiosResponse<ApiPort>> => {
  return request({
    url: url + '/apiPort',
  });
};

export const uploadFile = (
  url: string,
  file: File,
  fileAttr: FileAttr,
): Promise<AxiosResponse<{ reference: string }>> => {
  let fileName: string = fileAttr.name;
  let headers: AxiosRequestConfig['headers'] = {};
  if (fileName) {
    headers['Collection-Name'] = encodeUnicode(fileName);
  }
  headers['Pin'] = fileAttr.pin;
  if (fileAttr.isTar) {
    headers['Collection'] = true;
    headers['Content-Type'] = 'application/x-tar';
    if (fileAttr.dOpen) {
      headers['Index-Document'] = encodeUnicode(fileAttr.dOpen);
    }
    if (fileAttr.eOPen) {
      headers['Error-Document'] = encodeUnicode(fileAttr.eOPen);
    }
  } else {
    headers['Content-Type'] = file.type || 'application/x-www-form-urlencoded';
  }
  return request({
    url: url + '/file',
    method: 'post',
    data: file,
    params: { name: fileName },
    headers,
    timeout: 0,
  });
};

export const pin = (url: string, hash: string): Promise<AxiosResponse<any>> => {
  return request({
    url: url + '/pins/' + hash,
    method: 'post',
  });
};

export const unPin = (
  url: string,
  hash: string,
): Promise<AxiosResponse<any>> => {
  return request({
    url: url + '/pins/' + hash,
    method: 'delete',
  });
};

export const getFilesList = (
  url: string,
  data: string,
): Promise<AxiosResponse<FileType[]>> => {
  return request({
    url: url + '/file?' + data,
    timeout: 60 * 1000,
    method: 'get',
  });
};

export const deleteFile = (url: string, hash: string): Promise<any> => {
  return request({
    url: url + '/file/' + hash,
    method: 'delete',
    timeout: 60 * 1000,
  });
};

export const downloadFile = (url: string, hash: string): Promise<any> => {
  return request({
    url: url + '/file/' + hash,
    method: 'get',
    responseType: 'blob',
  });
};

export const getTrafficInfo = (
  url: string,
): Promise<AxiosResponse<TrafficInfo>> => {
  return request({
    url: url + '/traffic/info',
  });
};

export const getTrafficCheques = (
  url: string,
): Promise<AxiosResponse<Cheque[]>> => {
  return request({
    url: url + '/traffic/cheques',
  });
};

export const cashOut = (
  url: string,
  overlay: string,
): Promise<AxiosResponse<{ hash: string }>> => {
  return request({
    url: url + '/traffic/cash/' + overlay,
    method: 'post',
    timeout: 60 * 1000,
  });
};

export const updateFileRegister = (
  url: string,
  overlay: string,
  bool: boolean,
): Promise<AxiosResponse<{ hash: string }>> => {
  return request({
    url: url + '/fileRegister/' + overlay,
    method: bool ? 'post' : 'delete',
    timeout: 30 * 1000,
  });
};

export const loadFileListMenu = (url: string) => {
  return request({
    url,
    method: 'get',
  });
};

// export const getChain = (url: string) => {
//   return request({
//     url: url + '/chain',
//     method: 'get'
//   })
// }

export default {
  isConnected,
  uploadFile,
  pin,
  unPin,
  getFilesList,
  deleteFile,
  downloadFile,
  getTrafficInfo,
  getTrafficCheques,
  cashOut,
  updateFileRegister,
  getPort,
  loadFileListMenu,
  // getChain,
};
