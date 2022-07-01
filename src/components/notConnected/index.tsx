import React from 'react';
import styles from './index.less';
import { eventEmitter } from '@/utils/util';

const NotConnected: React.FC = () => {
  return (
    <>
      <div className={styles.notConnected}>
        <p>Looks like your node is not connected</p>
        <p>
          please check your API / DebugAPI{' '}
          <a
            href={'javascript:void(0)'}
            className={'mainColor'}
            onClick={() => {
              eventEmitter.emit('changeSettingModal', true, 'notConnected');
            }}
          >
            settings
          </a>
        </p>
      </div>
    </>
  );
};
export default NotConnected;
