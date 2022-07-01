import React, { useEffect, useState } from 'react';
import styles from './index.less';
import classNames from 'classnames';

import narrowSvg from '@/assets/icon/narrow.svg';
import deleteSvg from '@/assets/icon/delete.svg';
import enlargeSvg from '@/assets/icon/enlarge.svg';

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
              <span>{props.title}</span>
              <div>
                {/*<img*/}
                {/*  src={full ? narrowSvg : enlargeSvg}*/}
                {/*  alt={''}*/}
                {/*  onClick={clickHandle}*/}
                {/*  style={{ cursor: 'pointer' }}*/}
                {/*/>*/}
                <img
                  src={deleteSvg}
                  onClick={() => {
                    setFull(false);
                    props.onCancel();
                  }}
                  alt={'cancel'}
                  style={{ cursor: 'pointer' }}
                />
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
