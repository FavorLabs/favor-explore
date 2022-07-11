import React, { useState, useEffect, useRef } from 'react';
import { useHistory, useSelector, useDispatch } from 'umi';
import { Layout, Menu, Button, message, Modal } from 'antd';
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
import { getScreenWidth } from '@/utils/util';
import { screenBreakpoint } from '@/config';
import AccountAddress from '@/components/accountAddress';
import Loading from '@/components/loading';
import SettingApi from '@/components/settingApi';
import FavorConfigEdit from '@/components/favorConfigEdit';
import './index.less';
import { Models } from '@/declare/modelType';
import { version, isElectron } from '@/config/version';
import { eventEmitter } from '@/utils/util';
import { speedTime } from '@/config/url';
import { sessionStorageApi } from '@/config/url';
import { checkSession } from '@/utils/util';
import Web3 from 'web3';
import logo from '@/assets/img/explore.png';

let ipcRenderer: any = null;
if (isElectron) {
  ipcRenderer = window.require('electron').ipcRenderer;
}

const { Header, Sider, Content } = Layout;

const Layouts: React.FC = (props) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [collapsed, setCollapsed] = useState(true);
  const [settingVisible, setSettingVisible] = useState(false);
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
  } = useSelector((state: Models) => state.global);

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
      key: '/',
      icon: <HomeOutlined />,
      label: 'Home',
      onClick: () => {
        switchPage('/');
      },
    },
    {
      key: '/info',
      icon: <InfoCircleOutlined />,
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
    // {
    //   key: '/setting',
    //   icon: <SettingOutlined />,
    //   label: 'Settings',
    //   onClick: () => {
    //     switchPage('/setting');
    //   },
    // },
  ];

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

  useEffect(() => {
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
    // eventEmitter.on('404', () => {
    //   dispatch({
    //     type: 'global/setStatus',
    //     payload: { status: false },
    //   });
    // });
    eventEmitter.on('changeSettingModal', (val, str) => {
      setSettingVisible(val);
    });
  }, []);

  useEffect(() => {
    if (timer.current) clearInterval(timer.current);
    console.log('status', status);
    if (status) {
      getMetrics(debugApi, true);
      // timer.current = setInterval(() => {
      //   dispatch({
      //     type: 'global/updateChart',
      //     payload: {},
      //   });
      // }, speedTime);
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
                chunkInfoUpload: res.aurora_chunkinfo_total_transferred,
                chunkInfoDownload: res.aurora_chunkinfo_total_retrieved,
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
                retrievalUpload: res.aurora_retrieval_total_transferred,
                retrievalDownload: res.aurora_retrieval_total_retrieved,
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
    }
    //  else {
    //  setSettingVisible(true);
    //  }
  }, [status, api]);

  return (
    <>
      <Layout>
        <Sider
          defaultCollapsed={true}
          trigger={null}
          collapsible
          collapsed={collapsed}
          width="250"
          collapsedWidth={0}
          breakpoint={'md'}
          className="asider"
          onBreakpoint={(broken) => {
            // console.log(broken);
          }}
          onCollapse={(collapsed, type) => {
            // console.log(collapsed, type);
            setCollapsed(collapsed);
          }}
        >
          <div className="logo">
            <img src={logo} alt="logo" />
          </div>
          <Menu
            theme="light"
            mode="inline"
            defaultSelectedKeys={[`${history.location.pathname}`]}
            items={MenuItem}
          />
          <span
            className={
              collapsed ? 'trigger_btn trigger_btn_collapsed' : 'trigger_btn'
            }
          >
            {React.createElement(
              collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
              {
                className: 'trigger',
                onClick: () => setCollapsed(!collapsed),
              },
            )}
          </span>
        </Sider>
        <Layout className="site-layout">
          <Header className="site-layout-background layout-header">
            {/* <span className='icon iconfont icon-caidan menu-home'></span> */}
            {/* <HomeOutlined
              className="menu-home"
              onClick={() => {
                history.push('/');
              }}
            /> */}
            <div className="account-address">
              {/* <AccountAddress /> */}
              {/*<SettingOutlined*/}
              {/*  style={{ fontSize: '1.5rem' }}*/}
              {/*  onClick={() => {*/}
              {/*    setSettingVisible(true);*/}
              {/*  }}*/}
              {/*/>*/}
            </div>
          </Header>
          <Content
            className="site-layout-background layout-content"
            style={{
              margin: '15px 6px 0 6px',
              padding: 10,
              minHeight: 280,
            }}
          >
            <article>{props.children}</article>
            <Modal
              style={{ color: '#000' }}
              title={electron ? 'Config' : 'Setting'}
              maskClosable={false}
              visible={refresh || !status || settingVisible}
              centered
              closable={status}
              destroyOnClose={true}
              onCancel={closeSettingModal}
              footer={[
                <Button key={'connect'} onClick={saveApi}>
                  Connect
                </Button>,
              ]}
            >
              {electron ? (
                <>
                  <FavorConfigEdit />
                </>
              ) : (
                <SettingApi
                  value={apiValue.trim()}
                  title={'API Endpoint'}
                  fn={setApiValue}
                  saveApi={saveApi}
                />
              )}
            </Modal>
          </Content>
        </Layout>
        <div
          className="sider-mask"
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
