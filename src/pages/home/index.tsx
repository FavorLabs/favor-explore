import React, { useEffect, useState, useRef, useReducer } from 'react';
import { Models } from '@/declare/modelType';
import styles from './index.less';
import { Input, Carousel, Modal, Button, Col, Row, message } from 'antd';
import { history, useSelector, useDispatch } from 'umi';
import { sessionStorageApi } from '@/config/url';
import { checkSession, isRunUrl } from '@/utils/util';
import favor from '@/assets/img/logo.png';
import favorTubeSvg from '@/assets/icon/favorTube.svg';
import { SearchOutlined } from '@ant-design/icons';
import NotConnected from '@/components/notConnected';
import SvgIcon from '@/components/svgIcon';
import filesSvg from '@/assets/icon/explore/files.svg';
import searchSvg from '@/assets/icon/explore/search.svg';
import logo_dt from '@/assets/img/logo_dt.png';
import logo_lt from '@/assets/img/logo_lt.png';

type shortcutType = {
  name: string;
  img: string;
  hash: string;
};

const Main: React.FC = () => {
  const dispatch = useDispatch();

  const { api, status, logoTheme } = useSelector(
    (state: Models) => state.global,
  );

  const [fileHash, setFileHash] = useState('');

  const data: shortcutType[] = [];

  const searchHandle = () => {
    if (fileHash.trim()) {
      isRunUrl(api, fileHash);
      // window.open(api + '/file/' + fileHash, '_block');
    }
  };

  useEffect(() => {
    console.log('home');
  }, []);

  return (
    <div className={styles.page_container}>
      <div className={styles.logo}>
        {/* <img src={favor} width={150} alt={'logo'} /> */}
        {/* <span>EXPLORE</span> */}
        {logoTheme === 'dark' ? (
          <img src={logo_dt} alt="" />
        ) : (
          <img src={logo_lt} alt="" />
        )}
      </div>
      <div className={styles['search-input']}>
        <Input
          className={styles.input}
          suffix={
            // <SearchOutlined style={{ fontSize: '1.3125rem', color: '#fff' }} onClick={searchHandle} />
            <SvgIcon svg={searchSvg} clickFn={searchHandle}></SvgIcon>
          }
          value={fileHash}
          onChange={(e) => setFileHash(e.currentTarget.value)}
          onPressEnter={searchHandle}
        ></Input>
        <div className={styles['to-files']}>
          <SvgIcon
            svg={filesSvg}
            clickFn={() => history.push('/files')}
          ></SvgIcon>
        </div>
      </div>
      <div className={styles.shortcut_box}>
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
