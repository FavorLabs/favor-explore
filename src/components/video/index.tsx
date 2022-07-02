import React, { useEffect, useRef } from 'react';
import styles from './index.less';
import Hls from 'hls.js';

import { message } from 'antd';

type Props = {
  src: string;
};

const Video: React.FC<Props> = (props) => {
  const ele = useRef<any>(null);
  useEffect(() => {
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(props.src);
      hls.attachMedia(ele.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        ele.current.play().catch(() => {
          message.error('video loading failed');
        });
      });
      hls.on(Hls.Events.ERROR, (event, data) => {
        message.error('video loading failed');
      });
    }
  }, []);
  return (
    <div className={styles.content}>
      <video id={'video'} ref={ele} width={'100%'} autoPlay controls muted />
    </div>
  );
};

export default Video;
