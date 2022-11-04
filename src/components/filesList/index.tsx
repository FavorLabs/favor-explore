import React, {
  ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Table,
  Tooltip,
  Popconfirm,
  Progress,
  Modal,
  message,
  Input,
  Button,
  Drawer,
} from 'antd';

const { confirm } = Modal;
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { AllFileInfo } from '@/declare/api';
import styles from './index.less';
import {
  DeleteOutlined,
  FolderOpenOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import CopyText from '@/components/copyText';
import { useDispatch, useSelector } from 'umi';
import { Models } from '@/declare/modelType';
import {
  getSize,
  stringToBinary,
  getProgress,
  getSuffix,
  isPC,
} from '@/utils/util';

import pinSvg from '@/assets/icon/explore/pin.svg';
import unpinSvg from '@/assets/icon/explore/unpin.svg';
import regSvg from '@/assets/icon/explore/register_open.svg';
import unRegSvg from '@/assets/icon/explore/register_closed.svg';
import informationSvg from '@/assets/icon/explore/information.svg';
import folderOpenSvg from '@/assets/icon/explore/folder_open.svg';
import modifySvg from '@/assets/icon/explore/modify.svg';
import deleteSvg from '@/assets/icon/explore/delete.svg';
import closureSvg from '@/assets/icon/explore/closure.svg';
import moreSvg from '@/assets/icon/explore/more.svg';
import Popup from '@/components/popup';
import SourceInfo from '@/components/sourceInfo';
import SvgIcon from '@/components/svgIcon';
import { updateFileRegister } from '@/api/api';
import { mapQueryM3u8 } from '@/utils/util';
import Loading from '@/components/loading';
import Folder from '@/components/folder';
import { ethers } from 'ethers';
import { filterType } from '@/models/files';
import {
  FilterValue,
  SorterResult,
  TableCurrentDataSource,
} from 'antd/lib/table/interface';

type OnChange = (
  pagination: TablePaginationConfig,
  filters: Record<string, FilterValue | null>,
  sorter: SorterResult<AllFileInfo> | SorterResult<AllFileInfo>[],
  extra: TableCurrentDataSource<AllFileInfo>,
) => void;

const FilesList: React.FC = () => {
  const dispatch = useDispatch();
  const ref = useRef<HTMLDivElement | null>(null);

  const { api, ws, health } = useSelector((state: Models) => state.global);
  const { filesList, downloadList, filesTotal, queryData } = useSelector(
    (state: Models) => state.files,
  );

  const [hashInfo, setHashInfo] = useState<AllFileInfo | null>(null);

  const [loading, setLoading] = useState(false);
  const [top, setTop] = useState(0);
  const [fileMenuVisible, setFileMenuVisible] = useState(false);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [operateDrawer, setOperateDrawer] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<AllFileInfo | null>(null);

  const pageSizeOption = [10, 20, 50, 100];

  let [fileNameValue, setFileNameValue] = useState('');
  let [fileHashValue, setFileHashValue] = useState('');

  const tableChange: OnChange = (pagination, filters, sorter, extra) => {
    // console.log('onchange', extra);
    if (extra.action === 'paginate') {
      paginationChange(pagination);
    } else if (extra.action === 'sort') {
      sortChange(sorter as SorterResult<AllFileInfo>);
    } else {
      // filters
    }
  };

  const paginationChange = (p: TablePaginationConfig) => {
    dispatch({
      type: 'files/changeQuery',
      payload: {
        url: api,
        options: {
          page: {
            pageNum: p.current,
            pageSize: p.pageSize,
          },
        },
      },
    });
  };

  const sortChange = (s: SorterResult<AllFileInfo>) => {
    console.log('s', s);
    let keyStr = 'rootCid';
    if (s.order === undefined) {
      keyStr = 'rootCid';
    } else {
      if (s.columnKey === 'hash') {
        keyStr = 'rootCid';
      } else if (s.columnKey === 'size') {
        keyStr = 'size';
      } else if (s.columnKey === 'pin') {
        keyStr = 'pinned';
      }
    }
    dispatch({
      type: 'files/changeQuery',
      payload: {
        url: api,
        options: {
          sort: {
            key: keyStr,
            order:
              s.order === undefined
                ? 'asc'
                : s.order === 'ascend'
                ? 'asc'
                : 'desc',
          },
        },
      },
    });
  };

  const fileNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFileNameValue(e.target.value);
  };

  const fileHashChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFileHashValue(e.target.value);
  };

  const searchHandel = () => {
    let temArr = [
      {
        key: 'name',
        value: fileNameValue,
      },
      {
        key: 'rootCid',
        value: fileHashValue,
      },
    ];
    let filterArr: filterType[] = [];
    temArr.forEach((item) => {
      if (item.value) {
        filterArr.push({
          key: item.key,
          value: item.value,
          term: 'cn',
        });
      }
    });
    dispatch({
      type: 'files/changeQuery',
      payload: {
        url: api,
        options: {
          filter: filterArr,
        },
      },
    });
    if (searchModalVisible) {
      setSearchModalVisible(false);
    }
  };

  const pinOrUnPin = (hash: string, pinState: boolean): void => {
    dispatch({
      type: 'files/pinOrUnPin',
      payload: {
        url: api,
        hash,
        pinState,
      },
    });
  };
  // delete
  const confirmDelete = (hash: string): void => {
    dispatch({
      type: 'files/deleteFile',
      payload: {
        url: api,
        hash,
      },
    });
  };

  const clickHandle = (hashInfo: AllFileInfo): void => {
    setHashInfo(hashInfo);
  };
  const registerHandle = async (overlay: string, status: boolean) => {
    try {
      setLoading(true);
      const { data } = await updateFileRegister(api, overlay, status);
      const provider = new ethers.providers.JsonRpcProvider(api + '/chain');
      let lock = false;
      let timer = setInterval(async () => {
        if (lock) return;
        lock = true;
        const res = await provider.getTransactionReceipt(data.hash);
        lock = false;
        if (res) {
          clearInterval(timer);
          setLoading(false);
          if (res.status) {
            dispatch({
              type: 'files/getFilesList',
              payload: {
                url: api,
              },
            });
            message.success('success');
          } else {
            message.error('Failure');
          }
        }
      }, 1000);
    } catch (e) {
      setLoading(false);
      if (e instanceof Error) message.error(e.message);
    }
  };
  // table field
  const columns: ColumnsType<AllFileInfo> = [
    {
      title: <div className={styles.head}>File</div>,
      key: 'hash',
      render: (text, record) => (
        <div className={styles.fileCol}>
          <div className={styles.fileName}>{record.manifest.name}</div>
          <div className={styles.fileDetail}>
            <span className={`${styles.fileRcid} ${styles['small-screen']}`}>
              <Tooltip placement="topLeft" title={record.rootCid}>
                {record.rootCid}
              </Tooltip>
            </span>
            <span className={`${styles.fileRcid} ${styles['large-screen']}`}>
              {record.rootCid}
            </span>
            <div className={styles.fileOperate}>
              <CopyText text={record.rootCid} />{' '}
              <div className={`mainColor ${styles['file-chunkinfo']}`}>
                <img
                  src={informationSvg}
                  alt=""
                  onClick={() => {
                    clickHandle(record);
                  }}
                />
              </div>
            </div>
          </div>
          {downloadList.indexOf(record.rootCid) !== -1 && (
            <div className={styles['download-precent']}>
              <Progress
                percent={getProgress(record.bitVector.b)}
                showInfo={false}
              />
            </div>
          )}
        </div>
      ),
      width: isPC() ? 450 : 150,
      sorter: true,
    },
    {
      title: <div className={styles.head}>Size</div>,
      key: 'size',
      render: (text, record) => (
        <span className={styles.size}>
          {record.manifest.type !== 'directory' &&
          record.manifest.size !== undefined
            ? getSize(record.manifest.size)
            : '*'}
        </span>
      ),
      align: 'center',
      width: 100,
      sorter: true,
    },
  ];

  const operation: ColumnsType<AllFileInfo> = [
    {
      title: <div className={styles.head}>Pin/UnPin</div>,
      key: 'pin',
      render: (text, record) => (
        <>
          {/0/.test(record.bitVector.b) || (
            <Tooltip
              placement="top"
              title={record.pinState ? 'unpin the file' : 'pin the file'}
              arrowPointAtCenter
            >
              <img
                alt={'pinStatus'}
                src={record.pinState ? pinSvg : unpinSvg}
                width={20}
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  pinOrUnPin(record.rootCid, record.pinState);
                }}
              />
            </Tooltip>
          )}
        </>
      ),
      align: 'center',
      width: 65,
      sorter: true,
    },
    {
      title: <div className={styles.head}>Register</div>,
      key: 'Register',
      render: (text, record) => (
        <>
          {/0/.test(record.bitVector.b) || (
            <Tooltip
              placement="top"
              title={record.register ? 'Unregister' : 'Register'}
              arrowPointAtCenter
            >
              <img
                alt={'register'}
                src={record.register ? regSvg : unRegSvg}
                width={32}
                style={{
                  cursor: 'pointer',
                  background: '#555',
                  borderRadius: '32px',
                }}
                onClick={() => {
                  registerHandle(record.rootCid, !record.register);
                }}
              />
            </Tooltip>
          )}
        </>
      ),
      align: 'center',
      width: 65,
    },
    {
      title: <div className={styles.head}>Open</div>,
      key: 'Open',
      render: (text, record) => (
        <div className={styles['operation-open']}>
          <img
            src={folderOpenSvg}
            alt="open"
            onClick={() => {
              if (
                record.manifest.type === 'file' ||
                record.manifest.type === 'directory'
              ) {
                // directory
                window.open(`${api}/file/${record.rootCid}/`);
                // console.log('record.manifest.type', record.manifest.type);
                // setCurrentRecord(record);
                // setFileMenuVisible(true);
              } else {
                // file
                if (getSuffix(record.manifest.default ?? '') === 'm3u8') {
                  window.open(`#/video/${record.rootCid}`);
                } else {
                  window.open(`${api}/file/${record.rootCid}`);
                }
              }
            }}
          />
        </div>
      ),
      align: 'center',
      width: 65,
    },
    {
      title: <div className={styles.head}>Modify</div>,
      key: 'Modify',
      render: (text, record) => (
        <div className={styles['operation-modify']}>
          <img
            src={modifySvg}
            alt=""
            onClick={() => {
              setCurrentRecord(record);
              setFileMenuVisible(true);
            }}
          />
        </div>
      ),
      align: 'center',
      width: 65,
    },
    {
      title: <div className={styles.head}>Delete</div>,
      key: 'Delete',
      render: (text, record) => (
        <div className={styles['operation-delete']}>
          <img
            src={deleteSvg}
            alt="delete"
            onClick={() => {
              confirm({
                content: (
                  <div className={styles['info-content-t']}>
                    <div className={`${styles.title} bold-font`}>
                      Are you sure to delete the file?
                    </div>
                    <div className={styles.name}>
                      FileName:&nbsp;&nbsp;<span>{record.manifest.name}</span>
                    </div>
                    RCID:&nbsp;&nbsp;<span>{record?.rootCid}</span>
                  </div>
                ),
                okText: 'Yes',
                okType: 'danger',
                icon: <></>,
                // maskClosable: true,
                centered: true,
                cancelText: 'No',
                onOk() {
                  confirmDelete(record.rootCid);
                },
              });
            }}
          />
        </div>
      ),
      width: 65,
      align: 'center',
    },
  ];

  if (isPC()) {
    operation.forEach((item) => {
      if (item.key === 'Register') {
        if (health?.bootNodeMode || health?.fullNode) {
          columns.push(item);
        }
      } else {
        columns.push(item);
      }
    });
  } else {
    columns.push({
      title: isPC() ? 'Operate' : '',
      key: 'operate',
      render: (text, record) => (
        <>
          <img
            src={moreSvg}
            alt="more"
            onClick={() => {
              setCurrentRecord(record);
              setOperateDrawer(true);
            }}
          />
        </>
      ),
      align: 'center',
      width: isPC() ? 90 : 55,
    });
  }

  const closeFileMenu = () => {
    dispatch({
      type: 'files/getFilesList',
      payload: {
        url: api,
      },
    });
    setFileMenuVisible(false);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    setTop(
      document.getElementsByClassName('ant-table')[0].getBoundingClientRect()
        .top,
    );
  }, []);

  const scrollY = useMemo(() => {
    let h = document.body.clientHeight - top - 190;
    if (h < 200) return 200;
    return h;
  }, [document.body.clientHeight, top]);
  // Table Data
  const data: AllFileInfo[] = useMemo(() => {
    return filesList.map((item) => {
      return {
        ...item,
        bitVector: {
          ...item.bitVector,
          b: stringToBinary(item.bitVector.b, item.bitVector.len),
        },
        // isM3u8: item.manifest.sub ? mapQueryM3u8(item.manifest.sub) : false,
        // manifestSize: item.manifest.sub
        //   ? Object.values(item.manifest.sub).reduce((total, item: any) => {
        //       return total + item.size;
        //     }, 0)
        //   : item.size * 256 * 1024,
      };
    });
  }, [filesList]);

  return (
    <div ref={ref}>
      <div className={styles.searchBox}>
        <div style={{ width: '40vw' }}>
          <Input
            placeholder="input search filename"
            allowClear
            onChange={fileNameChange}
            onPressEnter={searchHandel}
          />
        </div>
        <div style={{ width: '40vw', marginLeft: '50px' }}>
          <Input
            placeholder="input search filehash"
            allowClear
            onChange={fileHashChange}
            onPressEnter={searchHandel}
          />
        </div>
        <div className={`mainBackground bold-font ${styles['search-btn']}`}>
          <span onClick={searchHandel}>Search</span>
        </div>
      </div>
      <div
        className={`${styles['searchBox-m']} mainBackground`}
        onClick={() => {
          setSearchModalVisible(true);
        }}
      >
        Search
      </div>
      <Table<AllFileInfo>
        className={styles.filesList}
        dataSource={data}
        columns={columns}
        rowKey={(item) => item.rootCid}
        pagination={{
          position: ['bottomLeft'],
          responsive: true,
          showTitle: false,
          showSizeChanger: true,
          pageSizeOptions: pageSizeOption,
          current: queryData.page.pageNum,
          pageSize: queryData.page.pageSize,
          total: filesTotal,
        }}
        onChange={tableChange}
        locale={{ emptyText: 'No Data' }}
        scroll={data.length > scrollY / 80 ? { y: scrollY } : {}}
      />
      <Popup
        visible={!!hashInfo}
        onCancel={() => {
          setHashInfo(null);
        }}
        title={
          <>
            <div className={styles['info-content']}>
              <div className={`bold-font ${styles.name}`}>
                FileName:&nbsp;&nbsp;<span>{hashInfo?.manifest.name}</span>
              </div>
              <div className={`bold-font ${styles.rcid}`}>
                RCID:&nbsp;&nbsp;<span>{hashInfo?.rootCid}</span>
              </div>
            </div>
          </>
        }
      >
        {hashInfo && <SourceInfo hashInfo={hashInfo} />}
      </Popup>
      <Modal
        className={styles['file-menu']}
        maskClosable={false}
        visible={fileMenuVisible}
        centered
        closable={false}
        destroyOnClose={true}
        // onCancel={() => {
        //   setFileMenuVisible(false);
        // }}
        footer={null}
      >
        <Folder
          rootCid={currentRecord?.rootCid as string}
          changeRootCidFn={(cid) => {
            const temp = JSON.parse(JSON.stringify(currentRecord));
            temp.rootCid = cid;
            // console.log('temp', temp);
            setCurrentRecord(temp);
          }}
          closeMenuFn={closeFileMenu}
        ></Folder>
      </Modal>
      <Modal
        maskClosable={true}
        visible={searchModalVisible}
        centered
        closable={false}
        destroyOnClose={false}
        footer={null}
        className={styles['search-modal']}
      >
        <p className={`${styles.title} bold-font`}>Search</p>
        <div className={styles.inputs}>
          <Input
            placeholder="input search filename"
            allowClear
            onChange={fileNameChange}
            onPressEnter={searchHandel}
          />
          <Input
            placeholder="input search filehash"
            allowClear
            onChange={fileHashChange}
            onPressEnter={searchHandel}
          />
        </div>
        <div
          className={`mainBackground bold-font ${styles['search-modal-btn']}`}
        >
          <span onClick={searchHandel}>Search</span>
        </div>
        <div className={styles.closeSetting}>
          <SvgIcon
            svg={closureSvg}
            clickFn={() => setSearchModalVisible(false)}
          ></SvgIcon>
        </div>
      </Modal>
      <Drawer
        placement="bottom"
        closable={false}
        onClose={() => setOperateDrawer(false)}
        visible={operateDrawer}
        key="operateDrawer"
        className={styles['operate-drawer']}
        width="100%"
        height="auto"
      >
        {/0/.test(currentRecord?.bitVector.b as string) || (
          <>
            <div
              className={styles['operation-item']}
              onClick={() => {
                pinOrUnPin(
                  currentRecord?.rootCid as string,
                  currentRecord?.pinState as boolean,
                );
                setOperateDrawer(false);
              }}
            >
              <p>Pin/Unpin</p>
              <>
                {/0/.test(currentRecord?.bitVector.b as string) || (
                  <Tooltip
                    placement="top"
                    title={
                      currentRecord?.pinState
                        ? 'unpin the file'
                        : 'pin the file'
                    }
                    arrowPointAtCenter
                  >
                    <img
                      alt={'pinStatus'}
                      src={currentRecord?.pinState ? pinSvg : unpinSvg}
                      style={{ width: '1.4286rem', cursor: 'pointer' }}
                      // onClick={() => {
                      //   pinOrUnPin(
                      //     currentRecord?.rootCid as string,
                      //     currentRecord?.pinState as boolean,
                      //   );
                      //   setOperateDrawer(false);
                      // }}
                    />
                  </Tooltip>
                )}
              </>
            </div>
            {health?.bootNodeMode || health?.fullNode ? (
              <div
                className={styles['operation-item']}
                onClick={() => {
                  registerHandle(
                    currentRecord?.rootCid as string,
                    !currentRecord?.register,
                  );
                  setOperateDrawer(false);
                }}
              >
                <p>Register</p>
                <>
                  {/0/.test(currentRecord?.bitVector.b as string) || (
                    <Tooltip
                      placement="top"
                      title={
                        currentRecord?.register ? 'Unregister' : 'Register'
                      }
                      arrowPointAtCenter
                    >
                      <img
                        alt={'register'}
                        src={currentRecord?.register ? regSvg : unRegSvg}
                        style={{
                          width: '2.2857rem',
                          cursor: 'pointer',
                          background: '#555',
                          borderRadius: '32px',
                        }}
                        // onClick={() => {
                        //   registerHandle(
                        //     currentRecord?.rootCid as string,
                        //     !currentRecord?.register,
                        //   );
                        //   setOperateDrawer(false);
                        // }}
                      />
                    </Tooltip>
                  )}
                </>
              </div>
            ) : (
              <></>
            )}
          </>
        )}
        <div
          className={styles['operation-item']}
          onClick={() => {
            if (
              // record.manifest.type === 'file' ||
              currentRecord?.manifest.type === 'directory'
            ) {
              // directory
              window.open(`${api}/file/${currentRecord?.rootCid}/`);
            } else {
              // file
              if (getSuffix(currentRecord?.manifest.default ?? '') === 'm3u8') {
                window.open(`#/video/${currentRecord?.rootCid}`);
              } else {
                window.open(`${api}/file/${currentRecord?.rootCid}`);
              }
            }
            setOperateDrawer(false);
          }}
        >
          <p>Open</p>
          <div
          // onClick={() => {
          //   if (
          //     // record.manifest.type === 'file' ||
          //     currentRecord?.manifest.type === 'directory'
          //   ) {
          //     // directory
          //     window.open(`${api}/file/${currentRecord?.rootCid}`);
          //   } else {
          //     // file
          //     if (
          //       getSuffix(currentRecord?.manifest.default ?? '') === 'm3u8'
          //     ) {
          //       window.open(`#/video/${currentRecord?.rootCid}`);
          //     } else {
          //       window.open(`${api}/file/${currentRecord?.rootCid}`);
          //     }
          //   }
          //   setOperateDrawer(false);
          // }}
          >
            <img src={folderOpenSvg} alt="" style={{ width: '1.4286rem' }} />
          </div>
        </div>
        <div
          className={styles['operation-item']}
          onClick={() => {
            setFileMenuVisible(true);
            setOperateDrawer(false);
          }}
        >
          <p>Modify</p>
          <>
            <img
              className={styles['operation-modify']}
              src={modifySvg}
              alt=""
              // onClick={() => {
              //   setFileMenuVisible(true);
              //   setOperateDrawer(false);
              // }}
            />
          </>
        </div>
        <div
          className={`${styles['operation-item']} ${styles['delete-operate']}`}
          onClick={() => {
            confirm({
              content: (
                <div className={styles['info-content-t']}>
                  <div className={`${styles.title} bold-font`}>
                    Are you sure to delete the file?
                  </div>
                  <div className={styles.name}>
                    FileName:&nbsp;&nbsp;
                    <span>{currentRecord?.manifest.name}</span>
                  </div>
                  RCID:&nbsp;&nbsp;<span>{currentRecord?.rootCid}</span>
                </div>
              ),
              okText: 'Yes',
              okType: 'danger',
              icon: <></>,
              // maskClosable: true,
              centered: true,
              cancelText: 'No',
              onOk() {
                confirmDelete(currentRecord?.rootCid as string);
                setOperateDrawer(false);
              },
            });
          }}
        >
          <p>Delete</p>
          <>
            <img
              src={deleteSvg}
              alt="delete"
              style={{ width: '1.4286rem' }}
              // onClick={() => {
              //   confirm({
              //     content: (
              //       <div className={styles['info-content-t']}>
              //         <div className={`${styles.title} bold-font`}>
              //           Are you sure to delete the file?
              //         </div>
              //         <div className={styles.name}>
              //           FileName:&nbsp;&nbsp;
              //           <span>{currentRecord?.manifest.name}</span>
              //         </div>
              //         RCID:&nbsp;&nbsp;<span>{currentRecord?.rootCid}</span>
              //       </div>
              //     ),
              //     okText: 'Yes',
              //     okType: 'danger',
              //     icon: <></>,
              //     // maskClosable: true,
              //     centered: true,
              //     cancelText: 'No',
              //     onOk() {
              //       confirmDelete(currentRecord?.rootCid as string);
              //       setOperateDrawer(false);
              //     },
              //   });
              // }}
            />
          </>
        </div>
        <div
          className={`${styles.cancel} bold-font`}
          onClick={() => setOperateDrawer(false)}
        >
          Cancel
        </div>
      </Drawer>
      {loading && <Loading text={'Loading'} status={loading} />}
    </div>
  );
};

export default FilesList;
