import React from 'react';
import Video from '@/components/video';
import styles from './index.less';
import { IRouteComponentProps, useSelector } from 'umi';
import { Models } from '@/declare/modelType';

const Main: React.FC<IRouteComponentProps<{ path: string }>> = (props) => {
  const { api } = useSelector((state: Models) => state.global);
  const path = props.match.params.path;
  console.log(props.match.params);
  return (
    <div className={styles.content}>
      <Video src={`${api}/file/${path}`} />
    </div>
  );
};

export default Main;
