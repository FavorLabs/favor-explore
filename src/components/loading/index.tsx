import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import styles from './index.less';

export type Props = {
  text: string;
  status: boolean;
};

const Loading: React.FC<Props> = (props) => {
  return (
    <div className={styles.layer}>
      <Spin
        style={{ color: 'inherit' }}
        spinning={props.status}
        delay={500}
        size="large"
        indicator={<LoadingOutlined className={'mainColor'} />}
        tip={props.text}
      />
    </div>
  );
};
export default Loading;
