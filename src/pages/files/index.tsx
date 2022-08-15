import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'umi';
import { Models } from '@/declare/modelType';
import { Row, Col, Card, Input, Button, message } from 'antd';
import FileUpload from '@/components/fileUpload';
import Loading from '@/components/loading';
import FilesList from '@/components/filesList';
import NotConnected from '@/components/notConnected';
import { stringToBinary, getProgress } from '@/utils/util';
import styles from './index.less';

const Main: React.FC = () => {
  let dispatch = useDispatch();
  const { uploadStatus } = useSelector((state: Models) => state.files);
  const { api, ws } = useSelector((state: Models) => state.global);
  const { filesList, downloadList } = useSelector(
    (state: Models) => state.files,
  );
  const [hash, setHash] = useState('');

  const subResult = useRef({
    rootCidStatus: {
      id: 31,
      result: '',
    },
    rootCidList: {
      id: 32,
      result: '',
    },
  }).current;

  const getFilesList = (): void => {
    dispatch({
      type: 'files/getFilesList',
      payload: {
        url: api,
      },
    });
  };

  const subStatus = () => {
    ws?.send(
      {
        id: subResult.rootCidStatus.id,
        jsonrpc: '2.0',
        method: 'chunkInfo_subscribe',
        params: ['rootCidStatus'],
      },
      (err, res) => {
        if (err || res?.error) {
          message.error(err || res?.error);
        }
        subResult.rootCidStatus.result = res?.result;
        ws?.on(res?.result, (res) => {
          getFilesList();
        });
      },
    );
  };

  const subDownloadProgress = (rootCidList: string[]) => {
    return new Promise((resolve, reject) => {
      ws?.send(
        {
          id: subResult.rootCidList.id,
          jsonrpc: '2.0',
          method: 'chunkInfo_subscribe',
          params: ['downloadProgress', rootCidList],
        },
        (err, res) => {
          resolve({
            err,
            res,
          });
        },
      );
    });
  };

  const unSubDownloadProgress = () => {
    return new Promise((resolve, reject) => {
      ws?.send(
        {
          id: subResult.rootCidList.id,
          jsonrpc: '2.0',
          method: 'chunkInfo_unsubscribe',
          params: [subResult.rootCidList.result],
        },
        (err, res) => {
          resolve(res);
        },
      );
    });
  };

  const observeProgress = async () => {
    if (subResult.rootCidList.result !== '') {
      const unSubRes = await unSubDownloadProgress();
      if (unSubRes?.result) {
        subResult.rootCidList.result = '';
      }
    }
    if (filesList.length) {
      let newArr = filesList.filter((item) => {
        return /0/.test(stringToBinary(item.bitVector.b, item.bitVector.len));
      });
      let rootCidList = newArr.map((item) => {
        return item.rootCid;
      });
      if (rootCidList.length) {
        const { err, res } = await subDownloadProgress(rootCidList);
        if (err || res?.error) {
          message.error(err || res?.error);
        }
        subResult.rootCidList.result = res?.result;
        ws?.on(res?.result, (res) => {
          let newList = res;
          let oldList = JSON.parse(JSON.stringify(filesList));
          for (let i = 0; i < newList.length; i++) {
            for (let j = 0; j < oldList.length; j++) {
              if (oldList[j].rootCid === newList[i].RootCid) {
                oldList[j].bitVector = newList[i].Bitvector;
              }
            }
          }
          dispatch({
            type: 'files/setFilesList',
            payload: {
              filesList: oldList,
            },
          });
        });
      }
    }
  };

  const download = (hashValue: string): void => {
    hashValue = hashValue.trim();
    window.open(api + '/file/' + hashValue);
    if (filesList.findIndex((item) => item.rootCid === hashValue) === -1) {
      dispatch({
        type: 'files/addDLHash',
        payload: {
          hash: hashValue,
        },
      });
    }
    setHash('');
  };

  useEffect(() => {
    filesList.forEach((item, index) => {
      const i = downloadList.indexOf(item.rootCid);
      const status = !/0/.test(
        stringToBinary(item.bitVector.b, item.bitVector.len),
      );
      if (i !== -1) {
        if (status) {
          setTimeout(() => {
            dispatch({
              type: 'files/deleteDLHash',
              payload: { hash: item.rootCid },
            });
          }, 2000);
        }
      } else if (!status) {
        dispatch({
          type: 'files/addDLHash',
          payload: {
            hash: item.rootCid,
          },
        });
      }
    });
    observeProgress();
  }, [filesList]);

  const unSub = () => {
    Object.values(subResult).forEach((item) => {
      ws?.send(
        {
          id: item.id,
          jsonrpc: '2.0',
          method: 'chunkInfo_unsubscribe',
          params: [item.result],
        },
        (err, res) => {
          console.log(err, res);
        },
      );
    });
  };

  useEffect(() => {
    getFilesList();
    subStatus();
    return () => {
      dispatch({
        type: 'files/setDownloadList',
        payload: {
          downloadList: [],
        },
      });
      dispatch({
        type: 'files/initQueryData',
        payload: {
          queryData: {
            page: {
              pageNum: 1,
              pageSize: 10,
            },
            sort: {
              key: '',
              order: '',
            },
            filter: [],
          },
        },
      });
      unSub();
    };
  }, []);

  return (
    <div className={styles.content}>
      {/* <div className={styles['open-file']}>
        <Input
          placeholder="Enter file hash"
          value={hash}
          onChange={(e) => {
            setHash(e.currentTarget.value);
          }}
          onPressEnter={(e) => {
            if (hash) {
              download(hash);
            }
          }}
        />
        <Button
          type="primary"
          className={styles.openBtn}
          onClick={() => {
            download(hash);
          }}
          disabled={!hash}
        >
          open
        </Button>
      </div> */}
      <div className={styles['upload-file']}>
        <FileUpload />
      </div>
      <div>
        <FilesList />
      </div>
      {uploadStatus && (
        <Loading text={'File uploading'} status={uploadStatus} />
      )}
    </div>
  );
};

const Files: React.FC = () => {
  const { status } = useSelector((state: Models) => state.global);
  return <>{status ? <Main /> : <NotConnected />}</>;
};

export default Files;
