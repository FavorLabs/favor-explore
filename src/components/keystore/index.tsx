import React, { useState } from 'react';
import { Button, Input, message, Modal } from 'antd';
import DebugApi from '@/api/debugApi';
import { useSelector } from 'umi';
import { Models } from '@/declare/modelType';
import CopyText from '@/components/copyText';
import QRCode from 'qrcode.react';

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
      <Button
        onClick={() => {
          setKeyModel(true);
        }}
      >
        Export
      </Button>
      <Modal
        title="Export"
        visible={keyModel}
        footer={null}
        centered
        width={250}
        onCancel={() => {
          setKeyModel(false);
        }}
      >
        <Button onClick={clickKeystore}>keystore</Button>
        <Button onClick={clickPrivate} style={{ marginLeft: 20 }}>
          private
        </Button>
      </Modal>
      <Modal
        title="Password"
        visible={pwdModel}
        centered
        width={250}
        okText={'Confirm'}
        cancelText={'Cancel'}
        confirmLoading={loading}
        onOk={get}
        onCancel={() => {
          setLoading(false);
          setPwdModel(false);
        }}
      >
        <Input
          placeholder={'Please enter your password'}
          value={password}
          type={'password'}
          onChange={(e) => setPassword(e.target.value)}
        />
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
        </Modal>
      )}
    </>
  );
};

export default Keystore;
