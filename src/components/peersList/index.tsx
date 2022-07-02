import React, { useEffect, useMemo, useState, useRef } from 'react';
import styles from './index.less';
import { useDispatch } from 'umi';
import { Space, Table, Tag, Row, Col, Tooltip, Button, Modal } from 'antd';
import type { ColumnsType } from 'antd/lib/table';
import { Peer } from '@/declare/api';
import moment from 'moment';

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

  const columns: ColumnsType<Peer> = [
    {
      title: <div className={styles.head}>Index</div>,
      key: 'Index',
      width: 80,
      ellipsis: {
        showTitle: false,
      },
      render: (text, record, index) => index + 1,
    },
    {
      title: <div className={styles.head}>Peer Id</div>,
      key: 'Peer ID',
      width: 120,
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
        title: <div className={styles.head}>Expiration Date</div>,
        key: 'Expiration time',
        width: 180,
        render: (value, record, index) => {
          return moment(record.timestamp)
            .add(record.duration * 1000)
            .format('MMMM Do YYYY, HH:mm:ss');
        },
      },
      {
        title: 'Remove From List',
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
        width: 180,
      },
    );
  };

  const addColumnForNotBlock = () => {
    columns.push(
      {
        title: <div className={styles.head}>Direction</div>,
        key: 'Direction',
        dataIndex: 'direction',
        width: 100,
      },
      {
        title: 'Add to Block List',
        render: (value, record, index) => {
          return (
            <div>
              <Button
                onClick={() => {
                  setPeerInfo(record);
                  setVisible(true);
                }}
              >
                block
              </Button>
            </div>
          );
        },
        align: 'center',
        width: 150,
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
    // console.log('styles', styles);
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

  return (
    <div className={styles.content}>
      <Table
        className={styles['table-style']}
        columns={columns}
        dataSource={props.peers}
        rowKey={(item) => item.address}
        pagination={false}
        locale={{ emptyText: 'No Data' }}
        scroll={props.peers.length > scrollY / 55 ? { y: scrollY } : {}}
      />
      <Modal
        title={props.isBlockList ? 'remove' : 'block'}
        centered
        visible={visible}
        onOk={(e) => {
          props.isBlockList ? deleteBlock() : addBlock();
        }}
        onCancel={() => {
          setVisible(false);
        }}
      >
        <div>Are you sure to {props.isBlockList ? 'remove' : 'block'}?</div>
      </Modal>
    </div>
  );
};
export default PeersList;
