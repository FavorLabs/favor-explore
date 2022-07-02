import React, { useEffect, useRef, useState } from 'react';

import styles from './index.less';
import { useHistory, useSelector } from 'umi';
import { Models } from '@/declare/modelType';
import { Event } from 'electron';
import NotConnected from '@/components/notConnected';
import { isElectron } from '@/config/version';

let ipcRenderer: any = null;
if (isElectron) {
  ipcRenderer = window.require('electron').ipcRenderer;
}

const Log: React.FC = () => {
  const history = useHistory();
  const { electron } = useSelector((state: Models) => state.global);
  if (!electron) history.push('/404');
  const ref = useRef<HTMLDivElement>(null);
  const [logs, setLogs] = useState([]);
  useEffect(() => {
    ipcRenderer.on('logs', (event: Event, data: []) => {
      if (ref.current == null) return false;
      const isBottom =
        ref.current?.scrollHeight <=
        ref.current?.clientHeight + ref.current?.scrollTop;
      setLogs(data);
      if (isBottom) {
        ref.current?.scrollTo(0, ref.current?.scrollHeight);
      }
    });
    ipcRenderer.send('logs');
    let timer = setInterval(() => {
      ipcRenderer.send('logs');
    }, 5000);
    return () => {
      clearInterval(timer);
      ipcRenderer.removeAllListeners('logs');
    };
  }, []);
  return (
    <div className={styles.content} ref={ref}>
      <div className={styles.text}>
        {logs.map((item, index) => {
          return (
            <div key={index} style={{ marginBottom: 10, fontSize: 12 }}>
              {item}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Log;
