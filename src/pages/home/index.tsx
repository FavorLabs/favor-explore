import React, { useEffect, useState, useRef, useReducer } from 'react';
import { Models } from '@/declare/modelType';
import logo from '../../../public/logo.png';
import styles from './index.less';
import { Input, Carousel, Modal, Button } from 'antd';
import { history, useSelector, useDispatch } from 'umi';
import { sessionStorageApi } from '@/config/url';
import { checkSession } from '@/utils/util';

// type shortcutType = {
//   icon: String;
//   domain: String;
// };

type shortcutType = {
  name: string;
  url: string;
};

const Home: React.FC = () => {
  const dispatch = useDispatch();
  const [fileHash, setFileHash] = useState('');
  const [shortName, setShortName] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [shortcutModalAdd, setShortcutModalAdd] = useState(false);
  const [shortcutModalRemove, setShortcutModalRemove] = useState(false);
  const [removeShortcutIndex, setRemoveShortcutIndex] = useState(0);
  const { api, status, electron, ws } = useSelector(
    (state: Models) => state.global,
  );
  const [apiValue, setApiValue] = useState<string>(
    checkSession(sessionStorageApi) || api || '',
  );
  // const { trafficInfo, account } = useSelector((state: Models) => state.account);

  const fileHashRegExp: RegExp = /^[A-Za-z0-9]{64}$/;
  const shortcutSize: number = 6;
  // const shortcut: shortcutType[] = [
  //   {
  //     icon: 'no-data',
  //     domain: 'sample-videos',
  //   },
  //   {
  //     icon: 'no-data',
  //     domain: 'sample-videos-2',
  //   },
  //   {
  //     icon: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimg.jj20.com%2Fup%2Fallimg%2F911%2F101916141158%2F161019141158-3-1200.jpg&refer=http%3A%2F%2Fimg.jj20.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1657680196&t=add3caa6475495a0858f36690b778003',
  //     domain: 'sample-videos-3',
  //   },
  //   {
  //     icon: 'no-data',
  //     domain: 'sample-videos',
  //   },
  //   {
  //     icon: 'no-data',
  //     domain: 'sample-videos-2',
  //   },
  //   {
  //     icon: 'no-data',
  //     domain: 'sample-videos',
  //   },
  //   {
  //     icon: 'no-data',
  //     domain: 'sample-videos-2',
  //   },
  //   {
  //     icon: 'no-data',
  //     domain: 'sample-videos',
  //   },
  //   {
  //     icon: 'no-data',
  //     domain: 'sample-videos-2',
  //   },
  // ];

  // const shortcutGroup = (size: number): Array<shortcutType[]> => {
  //   let curPage: shortcutType[] = [];
  //   let res: shortcutType[][] = [];
  //   shortcut.forEach((item, index) => {
  //     curPage.push(item);
  //     if ((index + 1) % size === 0 || index === shortcut.length - 1) {
  //       if (index === shortcut.length - 1) {
  //         curPage.push({
  //           icon: 'newItemBtn',
  //           domain: '',
  //         });
  //       }
  //       res.push(JSON.parse(JSON.stringify(curPage)));
  //       curPage = [];
  //     }
  //   });
  //   if (size < shortcut.length) {
  //     return res;
  //   } else {
  //     const t = [...shortcut];
  //     t.push({
  //       icon: 'newItemBtn',
  //       domain: '',
  //     });
  //     return [t];
  //   }
  // };

  // @ts-ignore
  const shortcut: shortcutType[] = localStorage.getItem('shortcutList')
    ? JSON.parse(localStorage.getItem('shortcutList'))
    : [];

  const shortcutGroup = (size: number): Array<shortcutType[]> => {
    let curPage: shortcutType[] = [];
    let res: shortcutType[][] = [];
    shortcut.forEach((item, index) => {
      curPage.push(item);
      if ((index + 1) % size === 0 || index === shortcut.length - 1) {
        if (index === shortcut.length - 1) {
          curPage.push({
            url: 'newItemBtn',
            name: '',
          });
        }
        res.push(JSON.parse(JSON.stringify(curPage)));
        curPage = [];
      }
    });
    if (size < shortcut.length) {
      return res;
    } else {
      const t = [...shortcut];
      t.push({
        url: 'newItemBtn',
        name: '',
      });
      return [t];
    }
  };
  const searchHandle = () => {
    console.log('enter press', fileHash);
    if (fileHash) {
      if (fileHashRegExp.test(fileHash)) {
        console.log('is hash');
        api && openFile(api + '/file/' + fileHash);
      } else {
        console.log('is domain');
        let i = fileHash.indexOf('http');
        if (i !== -1 && i === 0) {
          openFile(fileHash);
        } else {
          openFile('http://' + fileHash);
        }
      }
    }
  };

  const openFile = (url: string) => {
    // @ts-ignore
    if (BUILD_ENV === 'app') {
      console.log('env: app');
      // @ts-ignore
      cordova.InAppBrowser.open(url, '_blank');
    } else {
      console.log('env: not app', api);
      window.open(url, '_blank');
    }
  };

  const addShortcutHandle = () => {
    console.log('addShortcutHandle');
    setShortcutModalAdd(true);
    // shortcut.push({
    //   icon: 'no-data',
    //   domain: 'baidu.com',
    // });
  };

  const saveShortcut = () => {
    console.log('saveShortcut');
    if (shortName && shortUrl) {
      console.log('value', shortName, shortUrl);
      const store = localStorage.getItem('shortcutList');
      if (store) {
        const storeObject: Array<Object> = JSON.parse(store);
        storeObject.push({
          name: shortName,
          url: shortUrl,
        });
        localStorage.setItem('shortcutList', JSON.stringify(storeObject));
      } else {
        localStorage.setItem(
          'shortcutList',
          JSON.stringify([
            {
              name: shortName,
              url: shortUrl,
            },
          ]),
        );
      }
      closeShortcutModal();
    }
  };
  const closeShortcutModal = () => {
    setShortcutModalAdd(false);
    setShortName('');
    setShortUrl('');
  };

  const closeShortcutRemoveModal = () => {
    setShortcutModalRemove(false);
  };

  const removeShortcut = () => {
    console.log('index', removeShortcutIndex);
    // @ts-ignore
    const store = JSON.parse(localStorage.getItem('shortcutList'));
    store.splice(removeShortcutIndex, 1);
    localStorage.setItem('shortcutList', JSON.stringify(store));
    setShortcutModalRemove(false);
  };

  useEffect(() => {
    console.log('home');
    // const
  }, []);

  return (
    <div className={styles['home-container']}>
      {/* <div className={styles['top-bar']}>
          <div className={styles.left}>
              <span className={`icon iconfont icon-info ${styles['info-button']}`} onClick={() => {
                  history.push('/info');
              }}></span>
          </div>
          <div className={styles.right} onClick={() => {
              history.push('/account');
          }}>
              <span className={styles['account-balance']}>{trafficToBalance(trafficInfo.balance)}</span>
              <span className={styles['account-address']}>{formatAddress(account)}</span>
          </div>
      </div> */}
      <div className={styles['main-content']}>
        <div className={styles.content}>
          <img src={logo} className={styles.logo} alt="" />
          <div className={styles['input-hash']}>
            <Input
              placeholder="file hash"
              onChange={(val) => {
                setFileHash(val.currentTarget.value);
              }}
              disabled={!status}
              onPressEnter={searchHandle}
            />
            <span
              className={`icon iconfont icon-search ${styles['search-btn']}`}
              onClick={searchHandle}
            ></span>
          </div>

          <Carousel
            dotPosition="bottom"
            dots={{ className: 'dots' }}
            className="home-carousel"
          >
            {shortcutGroup(shortcutSize).map((item, index) => (
              <ul className={styles['shortcut-list']} key={index}>
                {item.map((itm, idx) => {
                  return itm.url === 'newItemBtn' ? (
                    <li key={'li' + idx}>
                      <div
                        style={{ cursor: 'pointer' }}
                        className={styles.newItemBtn}
                        onClick={addShortcutHandle}
                      >
                        +
                      </div>
                    </li>
                  ) : (
                    <li key={'li' + idx}>
                      <div className={styles['item-layer']}>
                        <a
                          href={itm.url}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            // console.log('rightCLick', index === 0 ? ((idx + 1) * (index + 1) - 1) : (index * shortcutSize + (idx + 1) - 1));
                            let i =
                              index === 0
                                ? (idx + 1) * (index + 1) - 1
                                : index * shortcutSize + (idx + 1) - 1;
                            setShortcutModalRemove(true);
                            setRemoveShortcutIndex(i);
                          }}
                        >
                          <>
                            {itm.name === 'no-data' ? (
                              <div className={styles['item-icon']}></div>
                            ) : (
                              <img
                                src={`${itm.url}/favicon.ico`}
                                className={styles['item-icon']}
                                onError={(e) => {
                                  // console.log('img', e.target);
                                  // @ts-ignore
                                  e.target.src = logo;
                                  // @ts-ignore
                                  e.target.onerror = null;
                                }}
                              />
                            )}
                          </>
                          <span className={styles['item-name']}>
                            {itm.name}
                          </span>
                        </a>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ))}
          </Carousel>

          {/* <Modal
            style={{color: '#000'}}
            title="Setting"
            maskClosable={false}
            visible={settingVisible}
            centered
            destroyOnClose={true}
            onCancel={closeSettingModal}
            footer={[<Button key={'connect'} onClick={saveApi}>Connect</Button>]}
          >
            <SettingApi
              value={apiValue.trim()}
              title={'API Endpoint'}
              fn={setApiValue}
              saveApi={saveApi}
            />
          </Modal> */}
          <Modal
            style={{ color: '#000' }}
            title={null}
            maskClosable={true}
            visible={shortcutModalAdd}
            centered
            destroyOnClose={true}
            onCancel={closeShortcutModal}
            footer={[
              <Button key={'add'} onClick={saveShortcut}>
                add
              </Button>,
            ]}
          >
            <div className="shortcutName">
              <span>name：</span>
              <Input
                onChange={(e) => {
                  setShortName(e.target.value);
                }}
                placeholder="google"
              />
            </div>
            <div className="shortcutUrl">
              <span>url：</span>
              <Input
                onChange={(e) => {
                  setShortUrl(e.target.value);
                }}
                placeholder="https://www.google.com"
              />
            </div>
          </Modal>
          <Modal
            style={{ color: '#000' }}
            title={null}
            maskClosable={false}
            visible={shortcutModalRemove}
            centered
            destroyOnClose={true}
            closable={false}
            onCancel={closeShortcutRemoveModal}
            footer={[
              <Button key={'cancel'} onClick={closeShortcutRemoveModal}>
                cancel
              </Button>,
              <Button key={'remove'} onClick={removeShortcut}>
                remove
              </Button>,
            ]}
          >
            <span>Are you sure to remove this shortcut?</span>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default Home;
