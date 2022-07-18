import React, { useEffect, useState, useRef, useReducer } from 'react';
import { Models } from '@/declare/modelType';
import styles from './index.less';
import { Input, Carousel, Modal, Button, Col, Row } from 'antd';
import { history, useSelector, useDispatch } from 'umi';
import { sessionStorageApi } from '@/config/url';
import { checkSession } from '@/utils/util';
import favor from '@/assets/img/logo.png';
import favorTubeSvg from '@/assets/icon/favorTube.svg';
import { SearchOutlined } from '@ant-design/icons';
import NotConnected from '@/components/notConnected';

type shortcutType = {
  name: string;
  img: string;
  hash: string;
};

const Main: React.FC = () => {
  const dispatch = useDispatch();

  const { api, status } = useSelector((state: Models) => state.global);

  const [fileHash, setFileHash] = useState('');

  let data: shortcutType[] = [
    {
      img: favorTubeSvg,
      name: 'FavorTube',
      hash: '8a265cc5cc85d4714a77adc5757a6cbb6807598f2aed40e22eecadd594bf4592',
    },
  ];

  const searchHandle = () => {
    window.open(api + '/file/' + fileHash);
  };

  return (
    <div>
      <div className={styles.logo}>
        <img src={'./logo.png'} width={150} alt={'logo'} />
      </div>
      <div
        style={{
          maxWidth: 561,
          width: '80%',
          margin: 'auto',
          marginBottom: 16,
        }}
      >
        <Input
          className={styles.input}
          suffix={
            <SearchOutlined style={{ fontSize: 20 }} onClick={searchHandle} />
          }
          value={fileHash}
          onChange={(e) => setFileHash(e.currentTarget.value)}
        ></Input>
      </div>
      <div className={styles.input_box}>
        {data.map((item) => (
          <a
            href={api + '/file/' + item.hash}
            target={item.hash}
            key={item.hash}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                marginTop: 16,
                width: 48,
                height: 48,
                borderRadius: '50%',
                backgroundColor: '#ddd',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <img src={item.img} width={24} alt={''}></img>
            </div>
            <div
              style={{
                marginTop: 6,
                width: 104,
                height: 36,
                borderRadius: 36,
                padding: '2px 8px',
                backgroundColor: '#ddd',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {item.name}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};
const Home: React.FC = () => {
  const { status } = useSelector((state: Models) => state.global);
  return <>{status ? <Main /> : <NotConnected />}</>;
};

export default Home;
