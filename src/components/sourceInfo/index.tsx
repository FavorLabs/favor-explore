import React, { useEffect, useMemo, useState } from 'react';
import styles from './index.less';
import { getChunkSource } from '@/api/debugApi';
import { useSelector } from 'umi';
import { Models } from '@/declare/modelType';
import { AllFileInfo, ChunkSource } from '@/declare/api';

import { stringToBinary, getDownloadNumber } from '@/utils/util';
import ChunkTooltip from '@/components/chunkTooltip';
import classNames from 'classnames';

export declare type Props = {
  hashInfo: AllFileInfo;
};

export declare type Data = {
  overlay: string;
  chunkBit: {
    b: string;
    len: number;
  };
  downloadLen: number;
};

export const colorArr = [
  '#FFF',
  '#4147c4',
  '#d93a49',
  '#694d9f',
  '#dea32c',
  '#45b97c',
  '#77787b',
];

const SourceInfo: React.FC<Props> = (props) => {
  const { rootCid: hash, size: len } = props.hashInfo;
  // const { size: len } = props.hashInfo.manifest;
  const { debugApi } = useSelector((state: Models) => state.global);
  const [showLimit, setShowLimit] = useState(true);
  const [source, setSource] = useState<Data[] | null>(null);
  const [totalPercent, setTotalPercent] = useState(0);
  const changeData = (data: ChunkSource) => {
    let arr: Data[] = [];
    // let pyramidSource = false;
    data.chunkSource?.forEach((item, index) => {
      const binary = stringToBinary(item.chunkBit.b, item.chunkBit.len);
      let downloadLen = getDownloadNumber(binary);
      // if (item.overlay === data.pyramidSource) {
      //   downloadLen += len;
      //   pyramidSource = true;
      // }
      // item.chunkBit.len += len;
      // let preIndex = index - 1;
      let current = {
        ...item,
        chunkBit: {
          len: item.chunkBit.len,
          b: binary,
        },
        downloadLen,
      };
      arr.push(current);
    });
    // if (!pyramidSource) {
    //   let n = arr[0].chunkBit.len;
    //   arr.push({
    //     overlay: data.pyramidSource,
    //     chunkBit: {
    //       len: n,
    //       b: '0'.repeat(n),
    //     },
    //     downloadLen: len,
    //   });
    // }
    arr.sort((a, b) => {
      return b.downloadLen - a.downloadLen;
    });
    let allDownLen = 0;
    arr.forEach((item) => {
      allDownLen += item.downloadLen;
    });
    setTotalPercent((allDownLen / props.hashInfo.bitVector.len) * 100);
    return arr;
  };

  const getChunkArr = (data: Data[]) => {
    let chunkArr: number[] = [];
    let n = props.hashInfo.bitVector.len;
    // console.log('n', n);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < data.length; j++) {
        chunkArr[i] = 0;
        if (data[j].chunkBit.b[i] === '1') {
          if (j >= 5) {
            chunkArr[i] = 6;
          } else {
            chunkArr[i] = j + 1;
          }
          break;
        }
      }
    }
    // console.log('chunkArr', chunkArr,props.hashInfo.size);
    return new Array(len).fill(1).concat(chunkArr);
  };

  useEffect(() => {
    getChunkSource(debugApi, hash).then(({ data }) => {
      if (data.chunkSource) {
        setSource(changeData(data));
      } else {
        setSource(null);
      }
    });
  }, []);
  return (
    <>
      {source ? (
        <div className={styles.content}>
          <div className={styles.sources}>
            <div className={`bold-font ${styles['chunk-title']}`}>
              <span>chunk source info</span>
              <span className={styles['total-percent']}>
                {totalPercent.toFixed(2) + '%'}
              </span>
            </div>
            <div className={styles.sourcesList}>
              {source.map((item, index) => {
                return (
                  <div
                    key={item.overlay}
                    className={classNames({
                      [styles.sourcesGrid]: true,
                    })}
                  >
                    <div className={styles.label}>
                      <div
                        style={{
                          width: 15,
                          height: 15,
                          backgroundColor:
                            index < 5 ? colorArr[index + 1] : colorArr[6],
                        }}
                      />
                      <div className={styles.overlay}>{item.overlay}</div>
                    </div>
                    <div className={styles.percent}>
                      {(
                        (item.downloadLen / props.hashInfo.bitVector.len) *
                        100
                      ).toFixed(2)}
                      %
                      {/* {item.downloadLen + ''}{props.hashInfo.bitVector.len + ''} */}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className={styles.chunk}>
            {source?.length && <ChunkTooltip chunk={getChunkArr(source)} />}
          </div>
        </div>
      ) : (
        <div className={styles.content}>
          <div className={styles.chunk}>
            <ChunkTooltip
              chunk={props.hashInfo.bitVector.b
                .split('')
                .map((item) => parseInt(item))}
            />
          </div>
        </div>
      )}
    </>
  );
};
export default SourceInfo;
