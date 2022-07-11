import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Upload,
  Button,
  message,
  Modal,
  Input,
  Checkbox,
  Row,
  Col,
} from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import styles from './index.less';
import { useDispatch, useSelector } from 'umi';
import { Models } from '@/declare/modelType';
import { FileAttr } from '@/declare/api';
import { UploadFile } from 'antd/es/upload/interface';
import ipfsSVg from '@/assets/icon/ipfs.svg';
import { getInfo, ipfsDownload } from '@/api/ipfsApi';

import Api from '@/api/api';

// import FilesShowInfo from '@/components/filesShowInfo';

const { Dragger } = Upload;

export type IPFS_INFO = {
  link: string;
  hash: string;
  type: 'tar' | 'file';
};

const FileUpload: React.FC = () => {
  const dispatch = useDispatch();
  const { api } = useSelector((state: Models) => state.global);
  const [file, setFile] = useState<UploadFile | null>(null);
  const [fileAttr, setFileAttr] = useState<FileAttr>({
    isTar: false,
    pin: false,
    name: '',
    dOpen: '',
    eOPen: '',
  });
  const ipfsInfo = useRef<IPFS_INFO>({
    link: '',
    hash: '',
    type: 'file',
  });
  const [value, setValue] = useState('');
  const [ipfsModel, setIpfsModel] = useState(false);
  const [loading, setLoading] = useState(false);
  const beforeUpload = (file: UploadFile): boolean => {
    console.log(file);
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
    if (ipfsInfo.current.link) {
      dispatch({
        type: 'files/setUploadStatus',
        payload: { uploadStatus: true },
      });
      try {
        const { data } = await ipfsDownload(
          ipfsInfo.current.link,
          ipfsInfo.current.type,
          ipfsInfo.current.hash,
        );
        let blob = new Blob([data], {
          type: data.type,
        });
        await Api.uploadFile(api, blob, fileAttr, ipfsInfo.current.hash);
      } catch (e) {
        message.error((e as Error)?.message || 'Upload failed');
      }
      dispatch({
        type: 'files/setUploadStatus',
        payload: { uploadStatus: file },
      });
    } else {
      dispatch({
        type: 'files/upload',
        payload: {
          url: api,
          file,
          fileAttr,
        },
      });
    }
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
  const ipfsModelOk = async () => {
    setLoading(true);
    let link = value;
    if (!/http(s)?/.test(value)) {
      link = 'https://ipfs.io/ipfs/' + link;
    }
    let hash = link.substring(link.lastIndexOf('/') + 1);
    try {
      const { data } = await getInfo(link, hash);
      ipfsInfo.current = {
        link,
        hash,
        type: data.Objects[0].Links.length
          ? data.Objects[0].Links[0].Name
            ? 'tar'
            : 'file'
          : 'file',
      };
      setFileAttr({
        ...fileAttr,
        isTar: ipfsInfo.current.type === 'tar',
        name: hash,
      });
      setIpfsModel(false);
    } catch (e) {
      message.error(link + ' error');
    }
    setLoading(false);
  };
  const clear = (): void => {
    ipfsInfo.current = {
      link: '',
      hash: '',
      type: 'file',
    };
    setFile(null);
    setFileAttr({
      isTar: false,
      pin: false,
      name: '',
      dOpen: '',
      eOPen: '',
    });
  };
  useEffect(() => {
    if (!ipfsModel) {
      setValue('');
      setLoading(false);
    }
  }, [ipfsModel]);
  return (
    <Row className={styles.fileUpload}>
      {!ipfsInfo.current.link && (
        <Col span={24} lg={5} className={styles.uploadArea}>
          <Dragger
            maxCount={1}
            beforeUpload={beforeUpload}
            onRemove={onRemove}
            // listType={'picture'}
            fileList={fileList}
            onDrop={onDrop}
            itemRender={() => <></>}
          >
            <p className={styles.uploadIcon}>
              <InboxOutlined />
            </p>
            <p
              className={styles['ant-upload-text-pc']}
              style={{ color: '#000' }}
            >
              Click or drag file to this area to upload
            </p>
            <p
              className={styles['ant-upload-text-moblie']}
              style={{ color: '#000' }}
            >
              Click this area to upload
            </p>
          </Dragger>
        </Col>
      )}
      {!file && (
        <Col
          span={24}
          offset={0}
          lg={{ span: 5, offset: ipfsInfo.current.link ? 0 : 1 }}
        >
          <div className={styles.ipfs} onClick={() => setIpfsModel(true)}>
            <div style={{ height: 78, display: 'flex', alignItems: 'center' }}>
              <img src={ipfsSVg} alt={'ipfs'} width={37} />
            </div>
            <div>import from IPFS</div>
          </div>
        </Col>
      )}
      {(file || ipfsInfo.current.link) && (
        <Col
          span={24}
          offset={0}
          lg={{
            span: 12,
            offset: 1,
          }}
          className={styles.uploadAttrArea}
        >
          <div>
            <div className={styles.uploadAttr}>
              {ipfsInfo.current.link && (
                <div className={styles.radioGrid}>
                  <label>IPFS Source</label>
                  {ipfsInfo.current.link}
                </div>
              )}
              {(file?.type === 'application/x-tar' ||
                ipfsInfo.current.type === 'tar') && (
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
          </div>
          <div style={{ display: 'flex' }}>
            <Button className={styles.upload} type="primary" onClick={upload}>
              upload
            </Button>
            <Button className={styles.upload} type="primary" onClick={clear}>
              cancel
            </Button>
          </div>
        </Col>
      )}
      <Modal
        title="IPFS"
        confirmLoading={loading}
        centered
        onOk={ipfsModelOk}
        visible={ipfsModel}
        onCancel={() => setIpfsModel(false)}
        okButtonProps={{
          disabled: !value,
        }}
      >
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={'IPFS file hash or url'}
        ></Input>
      </Modal>
    </Row>
  );
};
export default FileUpload;
