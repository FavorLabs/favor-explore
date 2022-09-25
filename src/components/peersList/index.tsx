import React, { useEffect, useMemo, useState, useRef } from 'react';
import styles from './index.less';
import { useDispatch } from 'umi';
import { Space, Table, Tag, Row, Col, Tooltip, Button, Modal } from 'antd';
import type { ColumnsType } from 'antd/lib/table';
import { Peer, block } from '@/declare/api';
import moment from 'moment';
import outboundSvg from '@/assets/icon/explore/outbound.svg';
import inboundSvg from '@/assets/icon/explore/inbound.svg';
import { isPC } from '@/utils/util';

export interface Props {
  peers: any;
  isBlockList: boolean;
}

const PeersList: React.FC<Props> = (props) => {
  const [top, setTop] = useState(0);
  const [peerInfo, setPeerInfo] = useState({});
  const dispatch = useDispatch();
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  const columns: ColumnsType<Peer & block> = [
    {
      title: isPC() ? <div className={styles.head}>Index</div> : '',
      key: 'Index',
      width: isPC() ? 60 : 55,
      ellipsis: {
        showTitle: false,
      },
      render: (text, record, index) => (
        <span className={styles['peer-index']}>{index + 1}</span>
      ),
      align: 'center',
    },
    {
      title: <div className={styles.head}>Peer ID</div>,
      key: 'Peer ID',
      width: isPC() ? 380 : 115,
      dataIndex: 'address',
      render: (value, record, index) => (
        <>
          <div className={styles['small-screen']}>
            <Tooltip placement="topLeft" title={record.address}>
              <span style={{ width: '100%' }} className={styles['peer-id']}>
                {record.address}
              </span>
            </Tooltip>
          </div>
          <div className={styles['large-screen']}>
            <span style={{ width: '100%' }} className={styles['peer-id']}>
              {record.address}
            </span>
          </div>
        </>
      ),
      ellipsis: {
        showTitle: false,
      },
    },
  ];

  const addColumnForBlock = () => {
    columns.push(
      {
        title: (
          <div className={styles.head}>
            {isPC() ? 'Expiration Date' : 'Expiration'}
          </div>
        ),
        key: 'Expiration time',
        width: isPC() ? 180 : 130,
        render: (value, record, index) => {
          return (
            <div className={styles['expiration-date']}>
              {moment(record.timestamp)
                .add(record.duration * 1000)
                .format('MMMM Do YYYY, HH:mm:ss')}
            </div>
          );
        },
      },
      {
        title: isPC() ? 'Remove From List' : 'Remove',
        render: (value, record, index) => {
          return (
            <div>
              <Button
                onClick={() => {
                  setPeerInfo(record);
                  setVisible(true);
                }}
              >
                remove
              </Button>
            </div>
          );
        },
        align: 'center',
        width: isPC() ? 180 : 120,
      },
    );
  };

  const addColumnForNotBlock = () => {
    columns.push(
      {
        title: <div className={styles.head}>Direction</div>,
        key: 'Direction',
        dataIndex: 'direction',
        width: isPC() ? 100 : 105,
        render: (value, record, index) => {
          return (
            <div>
              {record.direction === 'outbound' ? (
                <img
                  className={styles['direction-svg']}
                  src={outboundSvg}
                  alt=""
                />
              ) : (
                <img
                  className={styles['direction-svg']}
                  src={inboundSvg}
                  alt=""
                />
              )}
              &nbsp;
              {isPC() ? (
                <span className={styles['peer-status']}>
                  {record.direction}
                </span>
              ) : (
                <></>
              )}
            </div>
          );
        },
        align: 'center',
      },
      {
        title: isPC() ? 'Add to Block List' : 'Block',
        render: (value, record, index) => {
          return (
            <div>
              <span
                className={`mainColor ${styles.blockBtn}`}
                onClick={() => {
                  setPeerInfo(record);
                  setVisible(true);
                }}
              >
                Block
              </span>
            </div>
          );
        },
        align: 'center',
        width: isPC() ? 80 : 75,
      },
    );
  };

  const addBlock = () => {
    setVisible(false);
    dispatch({
      type: 'peers/addBlock',
      payload: peerInfo,
    });
  };

  const deleteBlock = () => {
    setVisible(false);
    dispatch({
      type: 'peers/deleteBlock',
      payload: peerInfo,
    });
  };

  if (props.isBlockList) {
    addColumnForBlock();
  } else {
    addColumnForNotBlock();
  }

  useEffect(() => {
    window.scrollTo(0, 0);
    setTop(
      document.getElementsByClassName('ant-table')[0].getBoundingClientRect()
        .top,
    );
  }, []);
  const scrollY = useMemo(() => {
    let h = document.body.clientHeight - top - 150;
    if (h < 200) return 200;
    return h;
  }, [document.body.clientHeight, top]);

  return (
    <div className={styles.content}>
      <Table
        className={styles['table-style']}
        columns={columns}
        dataSource={props.peers}
        rowKey={(item) => item.address}
        pagination={false}
        locale={{ emptyText: <span className={styles.no_data}>No Data</span> }}
        scroll={props.peers.length > scrollY / 55 ? { y: scrollY } : {}}
      />
      <Modal
        // title={props.isBlockList ? 'remove' : 'block'}
        className={`bold-font ${styles['block-remove-modal']}`}
        centered
        visible={visible}
        closable={false}
        // onOk={(e) => {
        //   props.isBlockList ? deleteBlock() : addBlock();
        // }}
        maskClosable={false}
        width={'31.4286rem'}
        footer={null}
        // onCancel={() => {
        //   setVisible(false);
        // }}
      >
        <p className={styles.title}>{props.isBlockList ? 'Remove' : 'Block'}</p>
        <div className={styles.desc}>
          Are you sure to {props.isBlockList ? 'remove' : 'block'}?
        </div>
        <div className={styles.btns}>
          <span
            className={`${styles.cancel}`}
            onClick={() => setVisible(false)}
          >
            Cancel
          </span>
          <span
            className={`mainBackground ${styles.ok}`}
            onClick={() => (props.isBlockList ? deleteBlock() : addBlock())}
          >
            OK
          </span>
        </div>
      </Modal>
    </div>
  );
};
export default PeersList;
