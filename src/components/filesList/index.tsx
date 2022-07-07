import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Table,
  Tooltip,
  Popconfirm,
  Progress,
  Modal,
  message,
  Input,
  Button,
} from 'antd';

const { confirm } = Modal;
import { ColumnsType } from 'antd/es/table';
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
import { getSize, stringToBinary, getProgress, getSuffix } from '@/utils/util';

import pinSvg from '@/assets/icon/pin.svg';
import unPinSvg from '@/assets/icon/unPin.svg';
import regSvg from '@/assets/icon/reg.svg';
import unRegSvg from '@/assets/icon/unReg.svg';
import Popup from '@/components/popup';
import SourceInfo from '@/components/sourceInfo';
import { updateFileRegister, loadFileListMenu } from '@/api/api';
import { mapQueryM3u8 } from '@/utils/util';
import Loading from '@/components/loading';
import { ethers } from 'ethers';

const FilesList: React.FC = () => {
  const dispatch = useDispatch();
  const ref = useRef<HTMLDivElement | null>(null);

  const { api, ws } = useSelector((state: Models) => state.global);
  const { filesList, downloadList, filesTotal, queryData } = useSelector(
    (state: Models) => state.files,
  );

  const [hashInfo, setHashInfo] = useState<AllFileInfo | null>(null);

  const [loading, setLoading] = useState(false);
  const [top, setTop] = useState(0);
  const [fileMenuVisible, setFileMenuVisible] = useState(false);

  const pageSizeOption = [10, 20, 50, 100];

  let [fileNameValue, setFileNameValue] = useState('');
  let [fileHashValue, setFileHashValue] = useState('');

  const tableChange = (pagination, filters, sorter, extra) => {
    console.log('onchange', extra);
    if (extra.action === 'paginate') {
      paginationChange(pagination);
    } else if (extra.action === 'sort') {
      sortChange(sorter);
    } else {
      // filters
    }
  };

  const paginationChange = (p) => {
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

  const sortChange = (s) => {
    console.log('s', s);
    let keyStr = 'rootCid';
    if (s.order === undefined) {
      keyStr = 'rootCid';
    } else {
      if (s.columnKey === 'hash') {
        keyStr = 'rootCid';
      } else if (s.columnKey === 'size') {
        keyStr = 'fileSize';
      } else if (s.columnKey === 'pin') {
        keyStr = 'pinState';
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

  const fileNameChange = (e) => {
    setFileNameValue(e.target.value);
  };

  const fileHashChange = (e) => {
    setFileHashValue(e.target.value);
  };

  const searchHandel = () => {
    let temArr = [
      {
        key: 'manifest.name',
        value: fileNameValue,
      },
      {
        key: 'rootCid',
        value: fileHashValue,
      },
    ];
    let filterArr = [];
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

  const loadFileListMenu = async () => {
    // const data = await loadFileListMenu(api)
  };

  // table field
  const columns: ColumnsType<AllFileInfo> = [
    {
      title: <div className={styles.head}>File</div>,
      key: 'hash',
      render: (text, record) => (
        <>
          <div style={{ fontSize: 16 }} className={styles.fileName}>
            {record.manifest.name}
          </div>
          <span style={{ marginRight: 5, color: '#666' }}>
            {record.rootCid}
          </span>
          <CopyText text={record.rootCid} />{' '}
          <ExclamationCircleOutlined
            style={{ cursor: 'pointer' }}
            onClick={() => {
              clickHandle(record);
            }}
            className={`mainColor ${styles['file-chunkinfo']}`}
          />
          {downloadList.indexOf(record.rootCid) !== -1 && (
            <div style={{ width: '70%', display: 'flex' }}>
              <Progress
                percent={getProgress(record.bitVector.b)}
                showInfo={false}
              />
            </div>
          )}
        </>
      ),
      width: 600,
      sorter: true,
    },
    {
      title: <div className={styles.head}>Size</div>,
      key: 'size',
      render: (text, record) => (
        <span style={{ fontSize: 16 }}>
          {record.manifest.type !== 'directory' &&
          record.manifest.size !== undefined
            ? getSize(record.manifest.size)
            : '*'}
        </span>
      ),
      align: 'center',
      width: 150,
      sorter: true,
    },
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
                src={record.pinState ? pinSvg : unPinSvg}
                width={25}
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
      width: 150,
      sorter: true,
    },
    {
      title: <div className={styles.head}>Register</div>,
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
                width={30}
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  registerHandle(record.rootCid, !record.register);
                }}
              />
            </Tooltip>
          )}
        </>
      ),
      align: 'center',
      width: 100,
    },
    {
      title: <div className={styles.head}>Open</div>,
      key: 'open',
      render: (text, record) => (
        <div
          onClick={() => {
            if (
              // record.manifest.type === 'file' ||
              record.manifest.type === 'directory'
            ) {
              // directory
              window.open(`${api}/file/${record.rootCid}`);
            } else {
              // file
              if (getSuffix(record.manifest.default ?? '') === 'm3u8') {
                window.open(`#/video/${record.rootCid}`);
              } else {
                window.open(`${api}/file/${record.rootCid}`);
              }
            }
          }}
        >
          <FolderOpenOutlined className={'mainColor iconSize'} />
        </div>
      ),
      align: 'center',
      width: 100,
    },
    {
      title: <div className={styles.head}>Delete</div>,
      key: 'Delete',
      render: (text, record) => (
        <>
          <DeleteOutlined
            style={{ color: '#666' }}
            className={'iconSize'}
            // onClick={() => {
            //   confirm({
            //     title: (
            //       <div className={'info_content'}>
            //         <div style={{ marginBottom: 10 }}>
            //           Are you sure to delete the file?
            //         </div>
            //         <div className={styles.name}>
            //           FileName:&nbsp;&nbsp;<span>{record.manifest.name}</span>
            //         </div>
            //         RCID:&nbsp;&nbsp;<span>{record?.rootCid}</span>
            //       </div>
            //     ),
            //     okText: 'Yes',
            //     okType: 'danger',
            //     icon: <></>,
            //     maskClosable: true,
            //     centered: true,
            //     cancelText: 'No',
            //     onOk() {
            //       confirmDelete(record.rootCid);
            //     },
            //   });
            // }}
          />
        </>
      ),
      width: 100,
      align: 'center',
    },
  ];

  useEffect(() => {
    setTop(
      document
        .getElementsByClassName('ant-table-tbody')[0]
        .getBoundingClientRect().top,
    );
  }, []);

  const scrollY = useMemo(() => {
    let h = document.body.clientHeight - top - 30;
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
        <div className={styles['search-btn']}>
          <Button
            style={{ marginLeft: '20px' }}
            type="primary"
            onClick={searchHandel}
          >
            Search
          </Button>
        </div>
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
            <div className={'info_content'}>
              <div className={styles.name}>
                FileName:&nbsp;&nbsp;<span>{hashInfo?.manifest.name}</span>
              </div>
              <div>
                RCID:&nbsp;&nbsp;<span>{hashInfo?.rootCid}</span>
              </div>
              <div>
                Reference:&nbsp;&nbsp;<span>{}</span>
              </div>
            </div>
          </>
        }
      >
        {hashInfo && <SourceInfo hashInfo={hashInfo} />}
      </Popup>
      <Modal
        style={{ color: '#000' }}
        title={'File List'}
        maskClosable={true}
        visible={fileMenuVisible}
        centered
        closable={true}
        destroyOnClose={true}
        onCancel={() => {
          setFileMenuVisible(false);
        }}
        footer={[
          <Button
            key={'close'}
            onClick={() => {
              setFileMenuVisible(false);
            }}
          >
            close
          </Button>,
        ]}
      >
        <div className="fileList">//</div>
      </Modal>
      {loading && <Loading text={'Loading'} status={loading} />}
    </div>
  );
};

export default FilesList;
