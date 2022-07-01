import React from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { message, Tooltip } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import styles from './index.less';

export type Props = {
  text: string;
};
const CopyText: React.FC<Props> = (props) => {
  const copyHandle = (): void => {
    message.success('Copy Success');
  };
  return (
    <>
      <CopyToClipboard text={props.text} onCopy={copyHandle}>
        <Tooltip title="copy" key={'copy'}>
          {props.children ? (
            props.children
          ) : (
            <CopyOutlined className={styles.iconColor} />
          )}
        </Tooltip>
      </CopyToClipboard>
    </>
  );
};
export default CopyText;
