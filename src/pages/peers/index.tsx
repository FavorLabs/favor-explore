import React, { useEffect, useRef, useState } from 'react';
import styles from './index.less';
import { Row, Col, Card, message, Button, Modal, Input } from 'antd';
import PeersList from '@/components/peersList';
import NotConnected from '@/components/notConnected';
import { useDispatch, useSelector } from 'umi';
import { Models } from '@/declare/modelType';
import { connect } from '@/api/debugApi';

const Main: React.FC = () => {
  const dispatch = useDispatch();
  const [peersList, setPeersList] = useState('full');
  const [isBlockList, setIsBlockList] = useState(false);
  const { debugApi, topology, ws } = useSelector(
    (state: Models) => state.global,
  );
  const { peers, blockList } = useSelector((state: Models) => state.peers);
  const [visible, setVisible] = useState(false);
  const [connectValue, setConnectValue] = React.useState('');

  const subResult = useRef({
    kad: {
      id: 21,
      result: '',
    },
  }).current;

  const subKad = () => {
    ws?.send(
      {
        id: subResult.kad.id,
        jsonrpc: '2.0',
        method: 'p2p_subscribe',
        params: ['kadInfo'],
      },
      (err, res) => {
        if (err || res?.error) {
          message.error(err || res?.error);
        }
        subResult.kad.result = res?.result;
        ws?.on(res?.result, (res) => {
          console.log(res);
          dispatch({
            type: 'global/setTopology',
            payload: {
              topology: {
                ...topology,
                population: res.population,
                depth: res.depth,
                connected: res.connected.full_nodes,
                bootNodes: {
                  ...topology.bootNodes,
                  connected: res.connected.boot_nodes,
                },
                lightNodes: {
                  ...topology.lightNodes,
                  connected: res.connected.light_nodes,
                },
              },
            },
          });
        });
      },
    );
  };

  const unSub = () => {
    Object.values(subResult).forEach((item) => {
      ws?.send(
        {
          id: item.id,
          jsonrpc: '2.0',
          method: 'traffic_unsubscribe',
          params: [item.result],
        },
        (err, res) => {
          console.log(err, res);
        },
      );
    });
  };

  const getInfo = () => {
    dispatch({
      type: 'global/getTopology',
      payload: {
        url: debugApi,
      },
    });
    dispatch({
      type: 'peers/getPeers',
      payload: {
        url: debugApi,
      },
    });
    dispatch({
      type: 'peers/getBlockList',
      payload: {
        url: debugApi,
        // url: 'http://183.221.217.71:1701'
      },
    });
  };

  useEffect(() => {
    // console.log('styles', styles);
    dispatch({
      type: 'info/getAddresses',
      payload: {
        url: debugApi,
      },
    });
    getInfo();
    subKad();
    return () => {
      unSub();
    };
  }, []);

  const cancel = (): void => {
    setConnectValue('');
    setVisible(false);
  };
  const connectHandle = async (): Promise<void> => {
    let underlay = connectValue.replace(/^(\/)*/, '');
    try {
      await connect(debugApi, underlay);
      message.success('successful');
      getInfo();
    } catch (err) {
      if (err instanceof Error) {
        let errMessage =
          err.message === 'already connected' ? 'already connected' : 'failed';
        message.info(errMessage);
      }
    }
    cancel();
  };

  return (
    <div className={styles.content}>
      <Row>
        <Col
          xs={{ span: 20, offset: 2 }}
          md={{ span: 5, offset: 1 }}
          xxl={{ span: 5, offset: 0 }}
        >
          <Card
            className={`${styles['card-style']} ${styles['card-minheight']}`}
            bordered={false}
            size="small"
          >
            <div className={styles['card-line']}>
              Discovered Full Peers
              <p>
                {(topology?.population || 0) +
                  (topology?.bootNodes?.population || 0)}
              </p>
            </div>
          </Card>
        </Col>
        <Col
          xs={{ span: 20, offset: 2 }}
          md={{ span: 5, offset: 1 }}
          xxl={{ span: 5, offset: 1 }}
        >
          <Card
            className={`${styles['card-style']} ${styles['card-minheight']}`}
            bordered={false}
            size="small"
          >
            <div className={styles['card-line']}>
              Connected Full Peers
              <p>
                {(topology?.connected || 0) +
                  (topology?.bootNodes?.connected || 0)}
              </p>
            </div>
          </Card>
        </Col>
        <Col
          xs={{ span: 20, offset: 2 }}
          md={{ span: 5, offset: 1 }}
          xxl={{ span: 5, offset: 1 }}
        >
          <Card
            className={`${styles['card-style']} ${styles['card-minheight']}`}
            bordered={false}
            size="small"
          >
            <div className={styles['card-line']}>
              Connected Light Peers
              <p>{topology?.lightNodes?.connected || 0}</p>
            </div>
          </Card>
        </Col>
        <Col
          xs={{ span: 20, offset: 2 }}
          md={{ span: 5, offset: 1 }}
          xxl={{ span: 5, offset: 1 }}
        >
          <Card
            className={`${styles['card-style']} ${styles['card-minheight']}`}
            bordered={false}
            size="small"
          >
            <div className={styles['card-line']}>
              Depth
              <p>{topology?.depth || 0}</p>
            </div>
          </Card>
        </Col>
      </Row>
      <div className={styles['peers-tabBar']}>
        <div className={styles['tabBar-left']}>
          <h4
            className={peersList === 'full' ? styles.selected : ''}
            onClick={() => {
              setPeersList('full');
              setIsBlockList(false);
            }}
          >
            Full Peers
          </h4>
          <h4
            className={peersList === 'light' ? styles.selected : ''}
            onClick={() => {
              setPeersList('light');
              setIsBlockList(false);
            }}
          >
            Light Peers
          </h4>
          <h4
            className={peersList === 'block' ? styles.selected : ''}
            onClick={() => {
              setPeersList('block');
              setIsBlockList(true);
            }}
          >
            Block List
          </h4>
        </div>
        <Button
          className={styles['addConnection-small']}
          type="primary"
          size="small"
          onClick={() => {
            setVisible(true);
          }}
        >
          Add
        </Button>
        <Button
          className={styles['addConnection-large']}
          type="primary"
          size="small"
          onClick={() => {
            setVisible(true);
          }}
        >
          Add Connection
        </Button>
        <Modal
          title="Add Connection"
          footer={[
            <Button key="back" onClick={cancel}>
              Cancel
            </Button>,
            <Button
              key="submit"
              disabled={!connectValue}
              onClick={connectHandle}
            >
              Add
            </Button>,
          ]}
          visible={visible}
          onCancel={cancel}
          centered={true}
          width={720}
          style={{ color: '#000' }}
          bodyStyle={{ padding: '20px 15px' }}
        >
          <div>
            <div>
              Insert the peer underlay/overlay address you want to connect to.
            </div>
            <div>Example:</div>
            <div className={'greyColor'}>
              /ip4/192.100.255.18/tcp/1634/p2p/16Uiu2HAkvEorAWzPfdbThKexs1TQAhAjXMTTwtSSsQNzdbbHUovK
            </div>
            {/*<div className={'greyColor'}>{addresses?.underlay?.[0]}</div>*/}
            {/*<div>or</div>*/}
            {/*<div className={'greyColor'}>{addresses?.overlay}</div>*/}
            <Input
              value={connectValue}
              onChange={(e) => setConnectValue(e.target.value)}
              style={{ marginTop: 10 }}
            />
          </div>
        </Modal>
      </div>
      <Row style={{ marginTop: '.5rem' }}>
        <Col>
          <PeersList
            peers={
              isBlockList
                ? blockList
                : peers.filter(
                    (item) => item.fullNode === (peersList === 'full'),
                  )
            }
            isBlockList={isBlockList}
          />
        </Col>
      </Row>
    </div>
  );
};

const Peers: React.FC = () => {
  const { status } = useSelector((state: Models) => state.global);
  return <>{status ? <Main /> : <NotConnected />}</>;
};

export default Peers;
