import React, { useEffect, useState, useRef, useReducer } from 'react';
import { Models } from '@/declare/modelType';
import styles from './index.less';
import { Input, Carousel, Modal, Button, Col, Row, message } from 'antd';
import { history, useSelector, useDispatch } from 'umi';
import { sessionStorageApi } from '@/config/url';
import { isRunUrl, applicationUrlParams } from '@/utils/util';
import favor from '@/assets/img/logo.png';
import { SearchOutlined } from '@ant-design/icons';
import NotConnected from '@/components/notConnected';
import SvgIcon from '@/components/svgIcon';
import filesSvg from '@/assets/icon/explore/files.svg';
import searchSvg from '@/assets/icon/explore/search.svg';
import applicationSvg from '@/assets/icon/application.svg';
import logo_dt from '@/assets/img/logo_dt.png';
import logo_lt from '@/assets/img/logo_lt.png';
import urlJoin from 'url-join';

const Main: React.FC = () => {
  const dispatch = useDispatch();

  const { api, status, logoTheme, application } = useSelector(
    (state: Models) => state.global,
  );

  const [fileHash, setFileHash] = useState('');

  const searchHandle = () => {
    if (fileHash.trim()) {
      // isRunUrl(api, fileHash);
      window.open(urlJoin(api, 'file', fileHash, '/'), '_blank');
    }
  };

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
      <div
        className={styles.shortcut_box}
        style={{
          justifyContent: application.length <= 4 ? 'center' : 'flex-start',
        }}
      >
        {application.map((item, index) => (
          <span
            onClick={() => {
              window.open(
                item?.url
                  ? urlJoin(item.url, `?endpoint=${api}`)
                  : urlJoin(
                      api,
                      'file',
                      item.hash,
                      item?.open ? item.open : '/',
                      applicationUrlParams(item),
                    ),
              );
            }}
            key={item.name + index}
            className={styles.shortcut_box_item}
          >
            <div className={styles.shortcut_box_item_icon}>
              <img src={item.icon || applicationSvg} width={24} alt={''}></img>
            </div>
            <div className={styles.shortcut_box_item_name}>{item.name}</div>
          </span>
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
