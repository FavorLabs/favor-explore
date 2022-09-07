import { FileSub, Application } from '@/declare/api';
import { queryType } from '@/models/files';
import moment from 'moment';
import EventEmitter from 'eventemitter3';
import { debounce } from 'lodash';
import { setTheme } from './theme';
import axios from 'axios';
import { message } from 'antd';
import React from 'react';

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
    parseFloat((size / Math.pow(1024, n)).toFixed(2)) +
    ' ' +
    levelList[level + n]
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

export const query = (params: queryType) => {
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

export const eventEmitter = new EventEmitter();

export const formatStr = (str: string, len: number) => {
  return str.substring(0, len) + '...';
};

export const flexible = (window: Window, document: Document) => {
  var docEl = document.documentElement;
  console.log('width', docEl.clientWidth, 'height', docEl.clientHeight);
  // var dpr = window.devicePixelRatio || 1;
  // const pcDefaultFontSize = 16;
  // const mobileDefaultFontSize = 16;
  // const pcDesignSize = 1920;
  // const mobileDesignSize = 375;
  const pcDefaultFontSize = 14;
  const mobileDefaultFontSize = 14;
  const pcDesignSize = 1440;
  const mobileDesignSize = 375;

  let targetWidth: number;

  function getTargetWidth() {
    if (isPC() || docEl.clientWidth > 1024) {
      console.log('pc device');
      targetWidth =
        docEl.clientWidth > docEl.clientHeight
          ? docEl.clientWidth
          : docEl.clientHeight;
    } else {
      console.log('mobile device');
      targetWidth =
        docEl.clientWidth <= docEl.clientHeight
          ? docEl.clientWidth
          : docEl.clientHeight;
    }
  }

  // adjust body font size
  function setBodyFontSize() {
    if (document.body) {
      // document.body.style.fontSize = 12 * dpr + "px";
      // document.body.setAttribute('data-dpr', dpr + '');
    } else {
      document.addEventListener('DOMContentLoaded', setBodyFontSize);
    }
  }
  setBodyFontSize();

  // set 1rem = viewWidth / 10
  function setRemUnit() {
    getTargetWidth();
    console.log('setRemUnit');
    if (docEl.clientWidth > 1024) {
      docEl.style.fontSize = `14px`;
      // docEl.style.fontSize = `${(pcDefaultFontSize / pcDesignSize) * targetWidth}px`;
    } else {
      // docEl.style.fontSize = `14px`;
      docEl.style.fontSize = `${
        (mobileDefaultFontSize / mobileDesignSize) * targetWidth
      }px`;
    }
  }
  setRemUnit();

  // reset rem unit on page resize
  window.addEventListener('resize', debounce(setRemUnit, 500));
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      setRemUnit();
    }
  });

  // detect 0.5px supports
  // if (dpr >= 2) {
  //   var fakeBody = document.createElement("body");
  //   var testElement = document.createElement("div");
  //   testElement.style.borderconsole.log("pc device");
  //   docEl.removeChild(fakeBody);
  // }
};

export const isPC = () => {
  let sUserAgent = navigator.userAgent.toLowerCase();
  let mIpad = sUserAgent.match(/ipad/i);
  let mIphoneOs = sUserAgent.match(/iphone os/i);
  let mMidp = sUserAgent.match(/midp/i);
  let mUc7 = sUserAgent.match(/rv:1.2.3.4/i);
  let mUc = sUserAgent.match(/ucweb/i);
  let mAndroid = sUserAgent.match(/android/i);
  let mCE = sUserAgent.match(/windows ce/i);
  let mWM = sUserAgent.match(/windows mobile/i);

  let bIsIpad = mIpad ? true : false;
  let bIsIphoneOs = mIphoneOs ? true : false;
  let bIsMidp = mMidp ? true : false;
  let bIsUc7 = mUc7 ? true : false;
  let bIsUc = mUc ? true : false;
  let bIsAndroid = mAndroid ? true : false;
  let bIsCE = mCE ? true : false;
  let bIsWM = mWM ? true : false;
  if (
    bIsIpad ||
    bIsIphoneOs ||
    bIsMidp ||
    bIsUc7 ||
    bIsUc ||
    bIsAndroid ||
    bIsCE ||
    bIsWM
  ) {
    return false;
  } else {
    return true;
  }
};

export const checkTheme = () => {
  let theme = localStorage.getItem('theme');
  theme ? setTheme(theme) : setTheme('dark');
};

export const isRunUrl = (api: string, fileHash: string) => {
  console.log('isRunUrl');
  const url = api + '/file/' + fileHash;
  const checkinfo = new Promise<boolean | string>((resolve, reject) => {
    axios
      .get(url, {
        // timeout: 1500,
      })
      .then((res) => {
        console.log('res', res);
        // resolve(true);
      })
      .catch((err) => {
        const info = err?.response?.data;
        console.log('err', info);
        clearTimeout(timer);
        message.error({
          content: info.code + ', ' + info.message,
          duration: 3,
        });
        // reject(JSON.stringify(info));
      });
    const timer = setTimeout(() => {
      window.open(api + '/file/' + fileHash, '_blank');
    }, 1800);
  });
};

export const stopPreventDefault = (event: React.MouseEvent) => {
  const e = event || window.event;
  e.preventDefault();
};

export const stopDragEventPropagation = (e: React.DragEvent) => {
  e.stopPropagation();
  e.nativeEvent.stopImmediatePropagation();
};

export const getUrlParams = (url: string) => {
  let urlStr = url.split('?')[1];
  const urlSearchParams = new URLSearchParams(urlStr);
  const result = Object.fromEntries(urlSearchParams.entries());
  return result;
};

export const getEndPoint = () => {
  const params = getUrlParams(location.href);
  if (params?.endpoint) {
    const api = params?.endpoint.split('#/')[0];
    return api;
  } else {
    return false;
  }
};

export const applicationUrlParams = (item: Application) => {
  let oracles = item.oracles.join(',');
  let chain = item.chain;
  if (oracles && chain) {
    return `?oracles=${oracles}&chain=true`;
  } else if (oracles) {
    return `?oracles=${oracles}`;
  } else if (chain) {
    return `?chain=true`;
  } else {
    return '';
  }
};
