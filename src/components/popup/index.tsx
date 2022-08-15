import React, { useEffect, useState } from 'react';
import styles from './index.less';
import classNames from 'classnames';
import SvgIcon from '../svgIcon';

import narrowSvg from '@/assets/icon/narrow.svg';
import deleteSvg from '@/assets/icon/delete.svg';
import enlargeSvg from '@/assets/icon/enlarge.svg';
import closureSvg from '@/assets/icon/explore/closure.svg';

type Props = {
  title?: string | React.ReactNode;
  visible: boolean;
  onCancel: () => void;
};
const Popup: React.FC<Props> = (props) => {
  const [full, setFull] = useState(false);
  const clickHandle = () => {
    setFull(!full);
  };
  return (
    <>
      {props.visible && (
        <div className={styles.layer}>
          <div
            className={classNames({
              [styles.frame]: true,
              [styles.frameFull]: full,
            })}
          >
            <div className={styles.header}>
              <div className={styles.title}>{props.title}</div>
              <div className={styles.close}>
                <SvgIcon
                  svg={closureSvg}
                  clickFn={() => {
                    setFull(false);
                    props.onCancel();
                  }}
                ></SvgIcon>
              </div>
            </div>
            <div className={styles.content}>{props.children}</div>
          </div>
        </div>
      )}
    </>
  );
};

export default Popup;
