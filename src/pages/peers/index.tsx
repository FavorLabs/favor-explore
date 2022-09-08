import React, { useEffect, useRef, useState } from 'react';
import styles from './index.less';
import { Row, Col, Card, message, Button, Modal, Input } from 'antd';
import PeersList from '@/components/peersList';
import NotConnected from '@/components/notConnected';
import { useDispatch, useSelector } from 'umi';
import { Models } from '@/declare/modelType';
import { connect } from '@/api/debugApi';
import closureSvg from '@/assets/icon/explore/closure.svg';
import SvgIcon from '@/components/svgIcon';

const Main: React.FC = () => {
  const dispatch = useDispatch();
  const [peersList, setPeersList] = useState('full');
  const [isBlockList, setIsBlockList] = useState(false);
  const { debugApi, topology, ws, health } = useSelector(
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
      },
    });
  };

  useEffect(() => {
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
    <div className={`${styles.content} bold-font`}>
      <Row className={styles['top-cards']}>
        <Col xs={{ span: 11, offset: 0 }} md={{ span: 5, offset: 0 }}>
          <Card
            className={`${styles['card-style']}`}
            bordered={false}
            size="small"
          >
            <div
              className={`${styles['card-line']} ${styles['card-minheight']}`}
            >
              <span>Discovered Full Peers</span>
              <p>
                {(topology?.population || 0) +
                  (topology?.bootNodes?.population || 0)}
              </p>
            </div>
          </Card>
        </Col>
        <Col xs={{ span: 11, offset: 1 }} md={{ span: 5, offset: 1 }}>
          <Card className={styles['card-style']} bordered={false} size="small">
            <div
              className={`${styles['card-line']} ${styles['card-minheight']}`}
            >
              <span>Connected Full Peers</span>
              <p>
                {(topology?.connected || 0) +
                  (topology?.bootNodes?.connected || 0)}
              </p>
            </div>
          </Card>
        </Col>
        <Col xs={{ span: 11, offset: 0 }} md={{ span: 5, offset: 1 }}>
          <Card className={styles['card-style']} bordered={false} size="small">
            <div
              className={`${styles['card-line']} ${styles['card-minheight']}`}
            >
              <span>Connected Light Peers</span>
              <p>{topology?.lightNodes?.connected || 0}</p>
            </div>
          </Card>
        </Col>
        <Col xs={{ span: 11, offset: 1 }} md={{ span: 5, offset: 1 }}>
          <Card className={styles['card-style']} bordered={false} size="small">
            <div
              className={`${styles['card-line']} ${styles['card-minheight']}`}
            >
              <span>Depth</span>
              <p>{topology?.depth || 0}</p>
            </div>
          </Card>
        </Col>
      </Row>
      <div className={styles['peers-tabBar']}>
        <div className={`${styles['tabBar-left']} bold-font`}>
          <h4
            className={peersList === 'full' ? styles.selected : ''}
            onClick={() => {
              setPeersList('full');
              setIsBlockList(false);
            }}
          >
            Full Peers
          </h4>
          {health?.bootNodeMode || health?.fullNode ? (
            <h4
              className={peersList === 'light' ? styles.selected : ''}
              onClick={() => {
                setPeersList('light');
                setIsBlockList(false);
              }}
            >
              Light Peers
            </h4>
          ) : (
            <></>
          )}
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
          className={`${styles['addConnection-small']} mainBackground bold-font`}
          size="small"
          onClick={() => {
            setVisible(true);
          }}
        >
          Add
        </Button>
        <span
          className={`${styles['addConnection-large']} mainColor bold-font`}
          onClick={() => {
            setVisible(true);
          }}
        >
          Add Connection
        </span>
        <Modal
          footer={null}
          visible={visible}
          closable={false}
          onCancel={cancel}
          centered={true}
          maskClosable={false}
          width={'42.8571rem'}
          className={`bold-font ${styles['add-connection-modal']}`}
          bodyStyle={{ padding: '20px 15px' }}
        >
          <div>
            <p className={styles.title}>Add Connection</p>
            <div className={styles.desc}>
              Insert the peer underlay/overlay address you want to connect to.
            </div>
            <div className={styles.example}>
              /ip4/192.100.255.18/tcp/1634/p2p/16Uiu2HAkvEorAWzPfdbThKexs1TQAhAjXMTTwtSSsQNzdbbHUovK
            </div>
            {/*<div className={'greyColor'}>{addresses?.underlay?.[0]}</div>*/}
            {/*<div>or</div>*/}
            {/*<div className={'greyColor'}>{addresses?.overlay}</div>*/}
            <Input
              value={connectValue}
              onChange={(e) => setConnectValue(e.target.value)}
              className={styles.input}
            />
            <Button
              className={`mainBackground ${styles.ok}`}
              key="submit"
              disabled={!connectValue}
              onClick={connectHandle}
            >
              OK
            </Button>
            {/* <img
              className={styles.close}
              src={closureSvg}
              alt=""
              onClick={() => setVisible(false)}
            /> */}
            <div className={styles.close}>
              <SvgIcon
                svg={closureSvg}
                clickFn={() => setVisible(false)}
              ></SvgIcon>
            </div>
          </div>
        </Modal>
      </div>
      <Row style={{ marginTop: '10px' }}>
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
