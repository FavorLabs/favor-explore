import React, { useMemo, useState } from 'react';
import { Upload, Button, message, Radio, Input, Checkbox } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import styles from './index.less';
import { useDispatch, useSelector } from 'umi';
import { Models } from '@/declare/modelType';
import { FileAttr } from '@/declare/api';
import { UploadFile } from 'antd/es/upload/interface';
// import FilesShowInfo from '@/components/filesShowInfo';

const { Dragger } = Upload;

const FileUpload: React.FC = () => {
  const dispatch = useDispatch();
  const { api } = useSelector((state: Models) => state.global);
  const [fileAttr, setFileAttr] = useState<FileAttr>({
    isTar: false,
    pin: false,
    name: '',
    dOpen: '',
    eOPen: '',
  });
  const [file, setFile] = useState<UploadFile | null>(null);
  const beforeUpload = (file: UploadFile): boolean => {
    setFile(file);
    return false;
  };
  const onRemove = (): void => {
    clear();
  };
  const onDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    if (!e.dataTransfer.items[0].webkitGetAsEntry()?.isFile) {
      setFile(null);
      message.info('Do not upload folders');
    }
  };
  const upload = async (): Promise<void | boolean> => {
    dispatch({
      type: 'files/upload',
      payload: {
        url: api,
        file,
        fileAttr,
      },
    });
    clear();
  };
  const fileList = useMemo(() => {
    setFileAttr({
      ...fileAttr,
      isTar: file?.type === 'application/x-tar',
      name: file?.name.split('.').slice(0, -1).join('.') || file?.name || '',
    });
    return file ? [file] : [];
  }, [file]);
  const clear = (): void => {
    setFile(null);
    setFileAttr({
      isTar: false,
      pin: false,
      name: '',
      dOpen: '',
      eOPen: '',
    });
  };
  return (
    <div className={styles.fileUpload}>
      <div className={styles.uploadArea}>
        <Dragger
          maxCount={1}
          beforeUpload={beforeUpload}
          onRemove={onRemove}
          // listType={'picture'}
          fileList={fileList}
          onDrop={onDrop}
        >
          <p className={styles.uploadIcon}>
            <InboxOutlined />
          </p>
          <p className={styles['ant-upload-text-pc']} style={{ color: '#000' }}>
            Click or drag file to this area to upload
          </p>
          <p
            className={styles['ant-upload-text-moblie']}
            style={{ color: '#000' }}
          >
            Click this area to upload
          </p>
        </Dragger>
      </div>
      <div className={styles.uploadAttrArea}>
        <div>
          {file && (
            <div className={styles.uploadAttr}>
              {file.type === 'application/x-tar' && (
                <div className={styles.radioGrid}>
                  <label>Directory</label>
                  <Checkbox
                    checked={fileAttr.isTar}
                    onChange={(e) => {
                      setFileAttr({ ...fileAttr, isTar: e.target.checked });
                    }}
                  />
                </div>
              )}
              <div className={styles.radioGrid}>
                <label>PinStatus</label>
                <Checkbox
                  checked={fileAttr.pin}
                  onChange={(e) => {
                    setFileAttr({ ...fileAttr, pin: e.target.checked });
                  }}
                />
              </div>
              <div className={styles.radioGrid}>
                <label style={{ marginBottom: '.5rem' }}>FileName</label>
                <Input
                  placeholder="File Name"
                  size="small"
                  value={fileAttr.name}
                  onChange={(e) => {
                    setFileAttr({ ...fileAttr, name: e.target.value });
                  }}
                />
              </div>
              {fileAttr.isTar && (
                <div className={styles.radioGrid}>
                  <label>DefaultOpen</label>
                  <Input
                    placeholder="Default Open"
                    size="small"
                    value={fileAttr.dOpen}
                    onChange={(e) => {
                      setFileAttr({ ...fileAttr, dOpen: e.target.value });
                    }}
                  />
                </div>
              )}
              {fileAttr.isTar && (
                <div className={styles.radioGrid}>
                  <label>ErrorOpen</label>
                  <Input
                    placeholder="Error Open"
                    size="small"
                    value={fileAttr.eOPen}
                    onChange={(e) => {
                      setFileAttr({ ...fileAttr, eOPen: e.target.value });
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
        <Button
          className={styles.upload}
          type="primary"
          onClick={upload}
          disabled={!file}
        >
          upload
        </Button>
      </div>
      {/* <FilesShowInfo /> */}
    </div>
  );
};
export default FileUpload;
