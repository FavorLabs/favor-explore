import { FileSub } from '@/declare/api';
import moment from 'moment';
import EventEmitter from 'eventemitter3';

export const getScreenWidth = () => {
  return window.innerWidth;
};

export const checkSession = (key: string): string | false => {
  const value = sessionStorage.getItem(key);
  if (value) return value;
  return false;
};
export const isURL = (url: string): boolean => {
  const strRegex =
    '^((https|http|ftp|rtsp|mms)?://)' +
    "?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?" +
    '(([0-9]{1,3}.){3}[0-9]{1,3}' +
    '|' +
    "([0-9a-z_!~*'()-]+.)*" +
    '([0-9a-z][0-9a-z-]{0,61})?[0-9a-z].' +
    '[a-z]{2,6})' +
    '(:[0-9]{1,5})?' +
    '((/?)|' +
    "(/[0-9a-zA-Z_!~*'().;?:@&=+$,%#-]+)+/?)$";
  const re = new RegExp(strRegex);
  return re.test(url);
};

export const getSize = (size: number, level: number = 0): string => {
  let levelList: string[] = ['B', 'KB', 'M', 'G', 'T'];
  let n: number = 0;
  while (size >= Math.pow(1024, n + 1)) {
    n++;
  }
  return (
    parseFloat((size / Math.pow(1024, n)).toFixed(2)) + levelList[level + n]
  );
};

export const stringToBinary = (b: string, len: number): string => {
  let value: string = '';
  let uStr: string = window.atob(b);
  for (let i: number = 0; i < uStr.length; i++) {
    let char = uStr.charCodeAt(i).toString(2);
    char = char.split('').reverse().join('');
    value += char + '0'.repeat(8 - char.length);
  }
  if (len < value.length) {
    value = value.substr(0, len);
  }
  return value;
};

export const getProgress = (b: string): number => {
  const oneLen: number = b.match(/1/g)?.length || 0;
  return (oneLen / b.length) * 100;
};

export const getDownloadNumber = (b: string): number => {
  return b.match(/1/g)?.length || 0;
};

export const getSuffix = (fileName: string): string | undefined => {
  return fileName.split('.').pop();
};

export const mapQueryM3u8 = (sub: FileSub): boolean => {
  for (let i in sub) {
    if (sub[i].type === 'index') {
      return getSuffix(i) === 'm3u8' && sub[i].mime !== 'application/x-tar';
    }
  }
  return false;
};

export const encodeUnicode = (str: string): string => {
  let res = [];
  for (let i = 0; i < str.length; i++) {
    res[i] = ('00' + str.charCodeAt(i).toString(16)).slice(-4);
  }
  return '\\u' + res.join('\\u');
};

export const decodeUnicode = (str: string): string => {
  str = str.replace(/\\/g, '%');
  return unescape(str);
};

export const initChartData = (n: number, speedTime: number = 5000): any[] => {
  const timestamp = moment().valueOf();
  const arr: any[] = [];
  for (let i = 0; i < n; i++) {
    arr.push({
      time: moment(timestamp - (n - i - 1) * speedTime)
        .utcOffset(480)
        .format('HH.mm.ss'),
      category: 'retrieved',
      speed: 0,
    });
    arr.push({
      time: moment(timestamp - (n - i - 1) * speedTime)
        .utcOffset(480)
        .format('HH.mm.ss'),
      category: 'transferred',
      speed: 0,
    });
  }
  return arr;
};

export const trafficToBalance = (traffic: number): any => {
  return (traffic / 10 ** 3).toFixed(3);
};

export const splitUrl = (url: string): [string, string, string] => {
  let i = new URL(url);
  return [i.protocol, i.hostname, i.port];
};

export const isFullNode = (b: string): boolean => {
  let value: string = '';
  let uStr: string = window.atob(b);
  for (let i: number = 0; i < uStr.length; i++) {
    let char = uStr.charCodeAt(i).toString(2);
    value += char;
  }
  return value.includes('1');
};

export const query = (params) => {
  let newParams = {
    page: JSON.stringify(params.page || {}),
    sort: JSON.stringify(params.sort || {}),
    filter: JSON.stringify(params.filter || []),
  };
  return Object.keys(newParams)
    .map((key) => [key, newParams[key]].map(encodeURIComponent).join('='))
    .join('&');
};

export const attributeCount = function (obj: any) {
  var count = 0;
  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      count++;
    }
  }
  return count;
};

export const formatAddress = (str: string) => {
  return str.substring(0, 5) + '...' + str.substring(str.length - 6);
};

export const mouseWheel = (obj: HTMLElement, fn: Function) => {
  // @ts-ignore
  const eName =
    document.onmousewheel === null ? 'mousewheel' : 'DOMMouseScroll';
  obj.addEventListener(eName, (e) => {
    // fn();
    console.log(e);
  });
};

export const eventEmitter = new EventEmitter();
