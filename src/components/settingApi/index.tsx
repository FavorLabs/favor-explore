import React, { KeyboardEvent } from 'react';
import styles from './index.less';
import { Button } from 'antd';
import { useSelector } from 'umi';
import { OnChange } from '@/declare/event';
import { Models } from '@/declare/modelType';
import closureSvg from '@/assets/icon/explore/closure.svg';
import SvgIcon from '../svgIcon';

export type Props = {
  value: string;
  title?: string;
  tip?: string;
  fn: (value: string) => void;
  saveApi: () => void;
  closeFn: () => void;
};
const SettingApi: React.FC<Props> = (props) => {
  const { status } = useSelector((state: Models) => state.global);

  const tip = 'Enter node host override / port';
  const change: OnChange = (e) => {
    props.fn(e.target.value);
  };
  const saveFn = (e: KeyboardEvent) => {
    if (e.keyCode === 13) {
      props.saveApi();
    }
  };
  const closeSettingModal = () => {
    props.closeFn();
  };
  return (
    <>
      <div className={styles.settingApi}>
        <p className={styles.title}>Setting</p>
        <div>
          <span className={styles.subtitle}>{props.title}</span>
        </div>
        <div className={styles.input}>
          <input value={props.value} onChange={change} onKeyDown={saveFn} />
        </div>
        <div className={styles.tip}>
          <span>({props.tip || tip})</span>
        </div>
        <Button
          type="primary"
          className={`mainBackground ${styles.saveBtn}`}
          onClick={() => props.saveApi()}
        >
          Save
        </Button>
        {status ? (
          <div className={styles.closeSetting}>
            <SvgIcon svg={closureSvg} clickFn={closeSettingModal}></SvgIcon>
          </div>
        ) : (
          <></>
        )}
      </div>
    </>
  );
};

export default SettingApi;
