import React, { useState } from 'react';
import { Button, Input, message, Modal, Tooltip } from 'antd';
import DebugApi from '@/api/debugApi';
import { useSelector } from 'umi';
import { Models } from '@/declare/modelType';
import CopyText from '@/components/copyText';
import SvgIcon from '../svgIcon';
import QRCode from 'qrcode.react';
import styles from './index.less';
import exportSvg from '@/assets/icon/explore/export_outlined.svg';
import closureSvg from '@/assets/icon/explore/closure.svg';

const Keystore = () => {
  const { debugApi } = useSelector((state: Models) => state.global);
  const [data, setData] = useState<any>(null);
  const [keyModel, setKeyModel] = useState(false);
  const [pwdModel, setPwdModel] = useState(false);
  const [dataModel, setDataModel] = useState(false);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [type, setType] = useState<'keystore' | 'private'>('keystore');
  const get = async () => {
    setLoading(true);
    try {
      const { data } = await DebugApi.getKeystore(debugApi, password, type);
      setData(data);
      setPwdModel(false);
      setDataModel(true);
    } catch (e) {
      message.error((e as Error).message);
    } finally {
      setLoading(false);
      setPassword('');
    }
  };
  const openPwdModel = () => {
    setKeyModel(false);
    setPwdModel(true);
  };
  const clickKeystore = () => {
    setType('keystore');
    openPwdModel();
  };
  const clickPrivate = () => {
    setType('private');
    openPwdModel();
  };
  return (
    <>
      <Tooltip title="export" key={'export'}>
        <img
          src={exportSvg}
          alt="export"
          className={styles['export-btn-svg']}
          onClick={() => {
            setKeyModel(true);
          }}
        />
      </Tooltip>
      <Modal
        visible={keyModel}
        footer={null}
        centered
        width={250}
        closable={false}
        maskClosable={false}
      >
        <p className={`${styles.title} bold-font`}>Export</p>
        <div className={`${styles['export-select-btns']} bold-font`}>
          <Button className="mainBackground" onClick={clickKeystore}>
            keystore
          </Button>
          <Button className="mainBackground" onClick={clickPrivate}>
            private
          </Button>
        </div>
        <div className={styles.closeSetting}>
          <SvgIcon
            svg={closureSvg}
            clickFn={() => {
              setKeyModel(false);
            }}
          ></SvgIcon>
        </div>
      </Modal>
      <Modal
        visible={pwdModel}
        centered
        width={300}
        confirmLoading={loading}
        closable={false}
        maskClosable={false}
        footer={null}
      >
        <p className={`${styles.title} bold-font`}>Password</p>
        <Input
          className={styles['password-input']}
          placeholder={'Please enter your password'}
          value={password}
          type={'password'}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className={`${styles['keystore-select-btns']} bold-font`}>
          <Button
            className="mainBackground"
            onClick={() => {
              setLoading(false);
              setPwdModel(false);
            }}
          >
            Cancel
          </Button>
          <Button className="mainBackground" onClick={get}>
            Confirm
          </Button>
        </div>
      </Modal>
      {data && (
        <Modal
          visible={dataModel}
          centered
          footer={null}
          onCancel={() => {
            setDataModel(false);
            setData(null);
          }}
          closable={false}
          maskClosable={false}
        >
          {type === 'keystore' ? (
            <>
              <div>{JSON.stringify(data)}</div>
              <CopyText text={JSON.stringify(data)}>
                <div style={{ textAlign: 'center', marginTop: 20 }}>
                  <Button>Copy Keystore</Button>
                </div>
              </CopyText>
            </>
          ) : (
            <div>
              <div style={{ textAlign: 'center' }}>
                <QRCode value={data.private_key} />
              </div>
              <div style={{ marginTop: 10 }}>
                {data.private_key} <CopyText text={data.private_key} />
              </div>
            </div>
          )}
          <div className={styles.closeSetting}>
            <SvgIcon
              svg={closureSvg}
              clickFn={() => {
                setDataModel(false);
                setData(null);
              }}
            ></SvgIcon>
          </div>
        </Modal>
      )}
    </>
  );
};

export default Keystore;
