import React, { useState, useEffect, useRef } from 'react';
import { useHistory, useSelector, useDispatch, useLocation } from 'umi';
import { Layout, Menu, Button, message, Modal, Input } from 'antd';
import '../assets/font/iconfont.css';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
  FileTextOutlined,
  PartitionOutlined,
  SettingOutlined,
  FieldTimeOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import {
  getScreenWidth,
  checkSession,
  eventEmitter,
  formatStr,
  getSize,
  isPC,
  flexible,
  checkTheme,
  isRunUrl,
} from '@/utils/util';
import { screenBreakpoint } from '@/config';
import AccountAddress from '@/components/accountAddress';
import Loading from '@/components/loading';
import SettingApi from '@/components/settingApi';
import FavorConfigEdit from '@/components/favorConfigEdit';
import SvgIcon from '@/components/svgIcon';
import styles from './index.less';
import Api from '@/api/api';
import { Models } from '@/declare/modelType';
import { version, isElectron } from '@/config/version';
import { speedTime } from '@/config/url';
import { sessionStorageApi } from '@/config/url';
import logo_d from '../assets/img/logo_d.png';
import logo_l from '../assets/img/logo_l.png';
import balanceSvg from '@/assets/icon/explore/balance.svg';
import settingSvg from '@/assets/icon/explore/setting.svg';
import infoSvg from '@/assets/icon/explore/info.svg';
import upSvg from '@/assets/icon/explore/up.svg';
import downSvg from '@/assets/icon/explore/down.svg';
import peersSvg from '@/assets/icon/explore/peers.svg';
import sunSvg from '@/assets/icon/explore/sun.svg';
import moonSvg from '@/assets/icon/explore/moon.svg';
import serachSvg from '@/assets/icon/explore/search.svg';
import expandSvg from '@/assets/icon/explore/expand.svg';
import '@/utils/theme.ts';
import { setTheme } from '@/utils/theme';
import { themeType } from '@/models/global';
import { defaultTheme } from '@/config/themeConfig';
import { version as exploreVersion } from '../../package.json';
import Web3 from 'web3';
import { ethers } from 'ethers';

type shortcutType = {
  name: string;
  img: string;
  hash: string;
};

let ipcRenderer: any = null;
if (isElectron) {
  ipcRenderer = window.require('electron').ipcRenderer;
}

const { Header, Sider, Content, Footer } = Layout;

const Layouts: React.FC = (props) => {
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();
  const [collapsed, setCollapsed] = useState(true);
  const [settingVisible, setSettingVisible] = useState(false);
  const [fileHash, setFileHash] = useState('');
  const [headerSearch, setHeaderSearch] = useState(false);
  const [accountDisplay, setAccountDisplay] = useState(false);
  const {
    status,
    metrics,
    api,
    debugApi,
    refresh,
    health,
    electron,
    wsApi,
    ws,
    topology,
    logoTheme,
  } = useSelector((state: Models) => state.global);
  const { trafficInfo, account } = useSelector(
    (state: Models) => state.accounting,
  );

  const [apiValue, setApiValue] = useState<string>(
    checkSession(sessionStorageApi) || api || '',
  );

  const subResult = useRef({
    chunkInfo: {
      id: 12,
      result: '',
    },
    retrieval: {
      id: 13,
      result: '',
    },
  }).current;
  let timer = useRef<null | NodeJS.Timer>(null);

  const MenuItem = [
    {
      key: '/info',
      icon: <img className={styles['menu-icon']} src={infoSvg} alt="" />,
      label: 'Info',
      onClick: () => {
        switchPage('/info');
      },
    },
    {
      key: '/peers',
      icon: <PartitionOutlined />,
      label: 'Peers',
      onClick: () => {
        switchPage('/peers');
      },
    },
    {
      key: '/files',
      icon: <FileTextOutlined />,
      label: 'Files',
      onClick: () => {
        switchPage('/files');
      },
    },
    {
      key: '/setting',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => {
        switchPage('/setting');
      },
    },
  ];

  const data: shortcutType[] = [
    {
      name: '',
      img: '',
      hash: '',
    },
    {
      name: '',
      img: '',
      hash: '',
    },
    {
      name: '',
      img: '',
      hash: '',
    },
    {
      name: '',
      img: '',
      hash: '',
    },
    {
      name: '',
      img: '',
      hash: '',
    },
    {
      name: '',
      img: '',
      hash: '',
    },
    {
      name: '',
      img: '',
      hash: '',
    },
    {
      name: '',
      img: '',
      hash: '',
    },
  ];

  const switchThemeSvg = logoTheme === 'dark' ? sunSvg : moonSvg;

  if (electron) {
    MenuItem.push({
      key: '/log',
      icon: <FieldTimeOutlined />,
      label: 'Log',
      onClick: () => {
        switchPage('/log');
      },
    });
  }

  const switchPage = (path: string) => {
    history.push(path);
    if (getScreenWidth() < screenBreakpoint.xl) {
      setCollapsed(true);
    }
  };

  const getMetrics = async (url: string, init: boolean = false) => {
    await dispatch({
      type: 'global/getMetrics',
      payload: { url, init },
    });
  };

  const saveApi = (): void => {
    sessionStorage.setItem(sessionStorageApi, apiValue.trim());
    if (!status || api !== apiValue.trim()) {
      ws?.disconnect();
      dispatch({
        type: 'global/getStatus',
        payload: {
          api: apiValue.trim(),
        },
      });
      dispatch({
        type: 'global/initMetrics',
      });
    } else {
      // console.log('!status || api !== apiValue.trim()', !status || api !== apiValue.trim());
      message.info('Connected');
      setSettingVisible(false);
    }
  };

  const closeSettingModal = () => {
    setSettingVisible(false);
  };

  const setThemeStatus = (theme: themeType) => {
    setTheme(theme);
    dispatch({
      type: 'global/setLogoTheme',
      payload: {
        logoTheme: theme,
      },
    });
  };

  const switchTheme = () => {
    const theme = localStorage.getItem('theme');
    console.log('theme', theme);
    if (theme) {
      if (theme === 'light') {
        setThemeStatus('dark');
      } else {
        setThemeStatus('light');
      }
    } else {
      setThemeStatus(defaultTheme);
    }
  };

  const searchHandle = () => {
    if (fileHash.trim()) {
      isRunUrl(api, fileHash);
      // window.open(api + '/file/' + fileHash, '_blank');
    }
  };

  const getBalance = async () => {
    const provider = new ethers.providers.JsonRpcProvider(api + '/chain');
    const accounts = await provider.listAccounts();
    const account = accounts[0];
    dispatch({
      type: 'accounting/setAccount',
      payload: {
        account,
      },
    });
  };

  const getTrafficInfo = async () => {
    await Api.getTrafficInfo(api)
      .then((res) => {
        dispatch({
          type: 'accounting/setTrafficInfo',
          payload: {
            trafficInfo: res.data,
          },
        });
        setAccountDisplay(true);
      })
      .catch((err) => {
        console.log('err', err);
        setAccountDisplay(false);
      });
  };

  useEffect(() => {
    flexible(window, document);
    // let theme = localStorage.getItem('theme');
    // theme ? setTheme(theme) : setTheme('dark');
    if (electron) {
      ipcRenderer.on('start', (event: any, message: any) => {
        dispatch({
          type: 'global/getStatus',
          payload: {
            api: message.api,
          },
        });
      });
      ipcRenderer.on('startLoading', () => {
        dispatch({
          type: 'global/setStatus',
          payload: {
            status: false,
          },
        });
        dispatch({
          type: 'global/setRefresh',
          payload: {
            refresh: true,
          },
        });
      });
      ipcRenderer.on('stopLoading', () => {
        dispatch({
          type: 'global/setRefresh',
          payload: {
            refresh: false,
          },
        });
        history.push('/log');
        message.info('The node is being started');
      });
    } else {
      dispatch({
        type: 'global/getStatus',
        payload: {
          api,
        },
      });
    }
    dispatch({
      type: 'global/setRefresh',
      payload: {
        refresh: true,
      },
    });
    eventEmitter.on('404', () => {
      dispatch({
        type: 'global/setStatus',
        payload: { status: false },
      });
    });
    eventEmitter.on('changeSettingModal', (val, str) => {
      setSettingVisible(val);
    });
  }, []);

  useEffect(() => {
    if (timer.current) clearInterval(timer.current);
    console.log('status', status);
    if (status) {
      getMetrics(debugApi, true);
      timer.current = setInterval(() => {
        dispatch({
          type: 'global/updateChart',
          payload: {},
        });
      }, speedTime);
      console.log('wsApi', wsApi);
      let ws: any = new Web3.providers.WebsocketProvider(wsApi, {
        reconnect: {
          auto: true,
        },
      });
      ws.on(ws.DATA, (res: any) => {
        ws.emit(res.params.subscription, res.params.result);
      });
      (ws.connection as WebSocket).addEventListener('close', (res) => {
        console.log('WS Close');
        dispatch({
          type: 'global/setStatus',
          payload: {
            status: false,
          },
        });
      });
      ws?.send(
        {
          id: subResult.chunkInfo.id,
          jsonrpc: '2.0',
          method: 'chunkInfo_subscribe',
          params: ['metrics'],
        },
        (err: Error, res: any) => {
          if (err || res?.error) {
            message.error(err || res?.error);
          }
          subResult.chunkInfo.result = res?.result;
          ws?.on(res?.result, (res: any) => {
            dispatch({
              type: 'global/updateChunkOrRetrieval',
              payload: {
                chunkInfoUpload: res.chunkinfo_total_transferred,
                chunkInfoDownload: res.chunkinfo_total_retrieved,
              },
            });
          });
        },
      );
      ws?.send(
        {
          id: subResult.retrieval.id,
          jsonrpc: '2.0',
          method: 'retrieval_subscribe',
          params: ['metrics'],
        },
        (err: Error, res: any) => {
          if (err || res?.error) {
            message.error(err || res?.error);
          }
          subResult.retrieval.result = res?.result;
          ws?.on(res?.result, (res: any) => {
            dispatch({
              type: 'global/updateChunkOrRetrieval',
              payload: {
                retrievalUpload: res.retrieval_total_transferred,
                retrievalDownload: res.retrieval_total_retrieved,
              },
            });
          });
        },
      );
      dispatch({
        type: 'global/setWs',
        payload: {
          ws,
        },
      });
      dispatch({
        type: 'global/getTopology',
        payload: {
          url: debugApi,
        },
      });
      if (api) {
        getBalance();
        getTrafficInfo();
      }
    }
    //  else {
    //  setSettingVisible(true);
    //  }
  }, [status, api]);

  useEffect(() => {
    history.listen((historyLocation) => {
      // console.log('router change', historyLocation);
      historyLocation.pathname === '/'
        ? setHeaderSearch(false)
        : setHeaderSearch(true);
      checkTheme();
    });
  }, [history]);

  return (
    <>
      <Layout className={styles.main_layout}>
        <Layout className={styles.site_layout}>
          <Header
            className={`site_layout_background ${styles.layout_header}`}
            onMouseLeave={() => {
              const expandEl = document.querySelector(
                '.expand-content',
              ) as HTMLElement;
              expandEl.className = expandEl.className.replace(
                'expand-show',
                'expand-hidden',
              );
              const timer = setTimeout(() => {
                clearTimeout(timer);
                expandEl.className = expandEl.className.replace(
                  'expand-hidden',
                  '',
                );
              }, 800);
            }}
          >
            <div className={styles.layout_header_left}>
              <div
                className={styles.explore_logo}
                onClick={() => history.push('/')}
              >
                {logoTheme === 'dark' ? (
                  <img src={logo_d} alt="" />
                ) : (
                  <img src={logo_l} alt="" />
                )}
              </div>
              {headerSearch && (
                <>
                  <div className={`${styles['header-search']}`}>
                    <Input
                      className={styles.input}
                      value={fileHash}
                      prefix={
                        <SvgIcon
                          svg={serachSvg}
                          clickFn={searchHandle}
                        ></SvgIcon>
                      }
                      onChange={(e) => setFileHash(e.currentTarget.value)}
                      onPressEnter={searchHandle}
                    ></Input>
                  </div>
                  {/* <div
                    className={styles.expand}
                    onMouseEnter={() => {
                      const expandEl = document.querySelector(
                        '.expand-content',
                      ) as HTMLElement;
                      const list = expandEl.classList;
                      // console.log('list', list);
                      if (list.length === 2) {
                        expandEl.className =
                          expandEl.className.trim() + ' expand-show';
                      } else {
                        if (
                          expandEl.className.indexOf('expand-hidden') !== -1
                        ) {
                          expandEl.className = expandEl.className.replace(
                            'expand-hidden',
                            'expand-show',
                          );
                        }
                      }
                    }}
                  >
                    <SvgIcon svg={expandSvg}></SvgIcon>
                  </div> */}
                </>
              )}
            </div>
            <div className={styles.layout_header_right}>
              {accountDisplay ? (
                <div
                  className={styles.account_info}
                  onClick={() => history.push('/account')}
                >
                  <span className={styles.blanceSvg}>
                    <SvgIcon svg={balanceSvg}></SvgIcon>
                  </span>
                  <span className={styles['account-info-mobile']}>
                    {trafficInfo.balance}&nbsp;FTC
                  </span>
                  <span className={styles['account-info-mobile']}>
                    {formatStr(account ? account : '', 8)}
                  </span>
                </div>
              ) : (
                <></>
              )}
              <div className={styles.set_theme_btn}>
                {logoTheme === 'dark' ? (
                  <SvgIcon svg={sunSvg} clickFn={() => switchTheme()}></SvgIcon>
                ) : (
                  <></>
                )}
                {logoTheme === 'light' ? (
                  <SvgIcon
                    svg={moonSvg}
                    clickFn={() => switchTheme()}
                  ></SvgIcon>
                ) : (
                  <></>
                )}
              </div>
              <div className={styles.setting_btn}>
                <SvgIcon
                  svg={settingSvg}
                  clickFn={() => setSettingVisible(true)}
                ></SvgIcon>
              </div>
              {/* <div className={styles.menu_btn}>
                <img
                  src={menuSvg}
                  onClick={() => {
                    setCollapsed(!collapsed);
                  }}
                />
              </div> */}
            </div>
            <div className={`${styles['expand-content']} expand-content`}>
              <nav>
                {data.map((item, index) => {
                  return (
                    <a
                      href={api + '/file/' + item.hash}
                      target="_blank"
                      key={item.hash + index}
                      className={styles['expand-item']}
                    ></a>
                  );
                })}
              </nav>
            </div>
          </Header>
          <Content
            className={`site_layout_background ${styles.layout_content}`}
          >
            <article>{props.children}</article>
            <Modal
              className={styles.setting_modal}
              style={{ position: 'relative' }}
              title={null}
              maskClosable={false}
              visible={refresh || !status || settingVisible}
              centered
              closable={false}
              destroyOnClose={true}
              onCancel={closeSettingModal}
              width={'31.4286rem'}
              footer={null}
            >
              {electron ? (
                <>
                  <FavorConfigEdit />
                </>
              ) : (
                <>
                  <SettingApi
                    value={apiValue.trim()}
                    title={'API Endpoint'}
                    fn={setApiValue}
                    saveApi={saveApi}
                    closeFn={closeSettingModal}
                  />
                </>
              )}
            </Modal>
          </Content>
          <Footer className={styles.layout_footer}>
            <div className={`${styles['layout-footer-info']} bold-font`}>
              {exploreVersion}
            </div>
            <div
              className={styles.layout_footer_left}
              onClick={() => history.push('/info')}
            >
              <div className={styles.to_info}>
                <img src={infoSvg} alt="" />
                <span>info</span>
              </div>
              <span className={`${styles.version_info}`}>
                <span className={`${styles.opacity_6} bold-font`}>
                  Version:
                </span>
                &nbsp;
                <span className="mainColor">{status && health?.version}</span>
              </span>
              <div className={styles.up_speed}>
                <img src={upSvg} alt="" />
                <span>
                  {getSize((metrics.uploadSpeed * 256) / (speedTime / 1000), 1)}
                  /s
                </span>
              </div>
              <div className={styles.down_speed}>
                <img src={downSvg} alt="" />
                <span>
                  {getSize(
                    (metrics.downloadSpeed * 256) / (speedTime / 1000),
                    1,
                  )}
                  /s
                </span>
              </div>
            </div>
            <div
              className={styles.layout_footer_right}
              onClick={() => history.push('/peers')}
            >
              <div className={styles.to_peers}>
                <img src={peersSvg} alt="" />
                <span>Peers</span>
              </div>
              <div className={`bold-font ${styles.connexted_full}`}>
                <span
                  className={`${styles.connected_peer_info} ${styles.opacity_6}`}
                >
                  Connected Full Peers:
                </span>
                <span className="mainColor">
                  {(topology?.connected || 0) +
                    (topology?.bootNodes?.connected || 0)}
                </span>
              </div>
              <div className="bold-font">
                <span
                  className={`${styles.connected_peer_info} ${styles.opacity_6}`}
                >
                  Depth:
                </span>
                <span className="mainColor">{topology?.depth || 0}</span>
              </div>
            </div>
          </Footer>
        </Layout>
        {/* <Sider
          defaultCollapsed={true}
          trigger={null}
          collapsible
          collapsed={collapsed}
          width="250"
          collapsedWidth={0}
          breakpoint={'lg'}
          className={styles['layout-sider']}
          onBreakpoint={(broken) => {
            // console.log(broken);
          }}
          onCollapse={(collapsed, type) => {
            // console.log(collapsed, type);
            // setCollapsed(collapsed);
          }}
        >
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={[]}
            items={MenuItem}
            className={styles.menu}
            style={{ marginTop: '2rem' }}
          />
        </Sider> */}
        <div
          className={styles.sider_mask}
          style={collapsed ? { display: 'none' } : {}}
          onClick={() => {
            setCollapsed(!collapsed);
          }}
        ></div>
      </Layout>
      {refresh && <Loading text={'loading...'} status={refresh} />}
    </>
  );
};

export default Layouts;
