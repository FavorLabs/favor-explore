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
  Drawer,
} from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import styles from './index.less';
import { useDispatch, useSelector } from 'umi';
import { Models } from '@/declare/modelType';
import { FileAttr } from '@/declare/api';
import { UploadFile } from 'antd/es/upload/interface';
import ipfsSvg from '@/assets/icon/explore/ipfs.svg';
import { getInfo, ipfsDownload } from '@/api/ipfsApi';
import Api from '@/api/api';
import { isPC } from '@/utils/util';
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
  const [uploadDrawer, setUploadDrawer] = useState(false);
  const [loading, setLoading] = useState(false);
  const beforeUpload = (file: UploadFile): boolean => {
    console.log(file);
    setFile(file);
    isPC() ? '' : setUploadDrawer(true);
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
    let urlInfo = new URL(link);
    let hash = urlInfo.pathname.split('/').pop() as string;
    let filename = urlInfo.searchParams.get('filename');
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
        name: filename || hash,
      });
      setIpfsModel(false);
    } catch (e) {
      message.error('Link Error');
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
    setUploadDrawer(false);
  };
  const importIpfsHtml = () => {
    return (
      <Col
        span={24}
        offset={0}
        lg={{ span: 11, offset: ipfsInfo.current.link ? 0 : 1 }}
        xs={{ span: 11, offset: 2 }}
        className={styles.ipfsArea}
      >
        <div
          className={`${styles.ipfs} bold-font`}
          onClick={() => setIpfsModel(true)}
        >
          <div style={{ height: 65, display: 'flex', alignItems: 'center' }}>
            <img src={ipfsSvg} alt={'ipfs'} width={37} />
          </div>
          <div>import from IPFS</div>
        </div>
      </Col>
    );
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
        <Col
          span={24}
          lg={11}
          xs={{ span: 11, offset: 0 }}
          className={styles.uploadArea}
        >
          <Dragger
            maxCount={1}
            beforeUpload={beforeUpload}
            onRemove={onRemove}
            // listType={'picture'}
            fileList={fileList}
            onDrop={onDrop}
            // height={100}
            itemRender={() => <></>}
          >
            <div className={styles.uploadInner}>
              <p className={styles.uploadIcon}>
                <InboxOutlined />
              </p>
              <p className={`${styles['ant-upload-text-pc']} bold-font`}>
                Click or drag file to this area to upload
              </p>
              <p className={`${styles['ant-upload-text-moblie']} bold-font`}>
                Click this area to upload
              </p>
            </div>
          </Dragger>
        </Col>
      )}
      {isPC() ? !file && importIpfsHtml() : importIpfsHtml()}
      {isPC() ? (
        (file || ipfsInfo.current.link) && (
          <Col
            span={24}
            offset={0}
            lg={{
              span: 12,
              offset: 1,
            }}
            xs={{ span: 11, offset: 2 }}
            className={styles.uploadAttrArea}
          >
            <div>
              <div className={styles.uploadAttr}>
                {ipfsInfo.current.link && (
                  <div className={styles.radioGrid}>
                    <label>IPFS Source</label>
                    <span className={styles.link}>{ipfsInfo.current.link}</span>
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
              <Button
                className={`${styles.upload} mainBackground`}
                type="primary"
                onClick={upload}
              >
                upload
              </Button>
              <Button
                className={`${styles.upload} mainBackground`}
                type="primary"
                onClick={clear}
              >
                cancel
              </Button>
            </div>
          </Col>
        )
      ) : (
        <></>
      )}
      <Modal
        confirmLoading={loading}
        centered
        visible={ipfsModel}
        closable={false}
        footer={null}
      >
        <p className="ipfs-title">IPFS</p>
        <Input
          className="ipfs-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={'IPFS file hash or url'}
        ></Input>
        <div className="ipfs-btns bold-font">
          <button className="cancel" onClick={() => setIpfsModel(false)}>
            Cancel
          </button>
          <button
            className="ok mainBackground"
            onClick={ipfsModelOk}
            disabled={!value}
            style={{ cursor: !value ? 'not-allowed' : 'pointer' }}
          >
            OK
          </button>
        </div>
      </Modal>
      <Drawer
        placement="bottom"
        closable={false}
        onClose={() => setUploadDrawer(false)}
        visible={uploadDrawer}
        key="uploadDrawer"
        className={styles['upload-drawer']}
        width="100%"
        height="auto"
      >
        <p className={`${styles.title} bold-font`}>Upload</p>
        <div className={styles.uploadAttr}>
          {(file?.type === 'application/x-tar' ||
            ipfsInfo.current.type === 'tar') && (
            <div className={styles.radioGrid}>
              <label>Directory</label>
              <div className={styles.checkbox}>
                <Checkbox
                  checked={fileAttr.isTar}
                  onChange={(e) => {
                    setFileAttr({ ...fileAttr, isTar: e.target.checked });
                  }}
                />
              </div>
            </div>
          )}
          <div className={styles.radioGrid}>
            <label>PinStatus</label>
            <div className={styles.checkbox}>
              <Checkbox
                checked={fileAttr.pin}
                onChange={(e) => {
                  setFileAttr({ ...fileAttr, pin: e.target.checked });
                }}
              />
            </div>
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
              className={styles['file-name']}
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
          <div className={styles['upload-btns']}>
            <Button
              className={`${styles.upload} mainBackground`}
              type="primary"
              onClick={upload}
            >
              upload
            </Button>
            <Button
              className={`${styles.cancel} mainBackground`}
              type="primary"
              onClick={clear}
            >
              cancel
            </Button>
          </div>
        </div>
      </Drawer>
    </Row>
  );
};
export default FileUpload;
