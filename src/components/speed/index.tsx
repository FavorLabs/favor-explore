import React, { useEffect, useState, memo, useRef } from 'react';
import { Chart } from '@antv/g2';
import { useSelector } from 'umi';
import { Models } from '@/declare/modelType';
import { getSize } from '@/utils/util';
import styles from './index.less';

export declare type DataType = {
  time: string;
  category: string;
  speed: number;
};
const Speed: React.FC = () => {
  const { metrics, chartData } = useSelector((state: Models) => state.global);
  let chart = useRef<any>(null);
  const init = (data: DataType[]): void => {
    chart.current = new Chart({
      container: 'speed',
      autoFit: true,
    });
    chart.current.data(data);

    chart.current.data(data);
    chart.current.scale({
      time: {
        // nice: true,
        tickCount: 10,
      },
      speed: {
        nice: true,
      },
    });

    chart.current.tooltip({
      // showCrosshairs: true,
      shared: true,
    });

    chart.current.axis('speed', {
      label: {
        formatter: (val: string) => {
          return val + 'MB/s';
        },
      },
    });

    chart.current.axis('time', {
      label: {
        formatter: (val: string) => {
          // return val.split('.').slice(0, -1).join('.');
          return val;
        },
      },
    });

    chart.current
      .line()
      .position('time*speed')
      // .color('category', '#4147C4-#b8741a')
      .color('category', '#1FD557-#B82F2F')
      .shape('smooth')
      .tooltip(
        'time*category*speed',
        function (time: number, category: string, speed: number) {
          return {
            name: category,
            value: getSize(speed * 1024 ** 2) + '/s',
          };
        },
      );
    chart.current.animate(false);
    chart.current.render();
  };
  useEffect(() => {
    if (chart.current && chartData.length) {
      chart.current.changeData(chartData);
    } else {
      init(chartData);
    }
  }, [chartData]);
  return (
    <div className={styles.content}>
      <div className={styles['tool-tip']}>
        <div className={styles['transferred-tip']}>
          {/* <div className={'uploadColor'} style={{ display: 'flex' }}> */}
          <div
            className={styles.block}
            style={{ backgroundColor: '#B82F2F' }}
          />
          {/* </div> */}
          <div className={`uploadColor ${styles.num}`}>
            <span className={styles.key}>Transferred:</span>
            <span className={styles.value}>
              {getSize(metrics.uploadTotal * 256, 1)}
            </span>
          </div>
        </div>
        <div className={styles['retrieved-tip']}>
          {/* <div
            className={'mainColor'}
            // style={{ marginLeft: 50, display: 'flex' }}
          > */}
          <div
            className={styles.block}
            style={{ backgroundColor: '#1FD557' }}
          />
          {/* </div> */}
          <div className={`uploadColor ${styles.num}`}>
            <span className={styles.key}>Retrieved:</span>
            <span className={styles.value}>
              {getSize(metrics.downloadTotal * 256, 1)}
            </span>
          </div>
        </div>
      </div>
      <div id="speed" className={styles.speed} />
    </div>
  );
};

export default memo(Speed);
