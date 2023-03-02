import React from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { message, Tooltip } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import styles from './index.less';
import copySvg from '@/assets/icon/explore/copy.svg';

export type Props = {
  text: string;
  callback?: () => void;
};
const CopyText: React.FC<Props> = (props) => {
  const copyHandle = (): void => {
    message.success('Copy Success');
    props.callback ? props.callback() : '';
  };
  return (
    <>
      <CopyToClipboard text={props.text} onCopy={copyHandle}>
        <Tooltip title="copy" key={'copy'}>
          {props.children ? (
            props.children
          ) : (
            // <CopyOutlined className={styles.iconColor} />
            <img src={copySvg} alt="" className={styles.iconColor} />
          )}
        </Tooltip>
      </CopyToClipboard>
    </>
  );
};
export default CopyText;
