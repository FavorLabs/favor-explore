import React, { useEffect, useRef } from 'react';
import styles from './index.less';
import { Row, Col, Card, message } from 'antd';
import NotConnected from '@/components/notConnected';
import { useDispatch, useSelector } from 'umi';
import { Models } from '@/declare/modelType';
import { getSize } from '@/utils/util';

const Main: React.FC = () => {
  const dispatch = useDispatch();
  const { debugApi, health, topology, ws, metrics } = useSelector(
    (state: Models) => state.global,
  );
  const { addresses } = useSelector((state: Models) => state.info);

  const subResult = useRef({
    kad: {
      id: 11,
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

  const getTopology = () => {
    dispatch({
      type: 'global/getTopology',
      payload: {
        url: debugApi,
      },
    });
  };

  useEffect(() => {
    // console.log('width', getScreenWidth());
    dispatch({
      type: 'info/getAddresses',
      payload: {
        url: debugApi,
      },
    });
    getTopology();
    subKad();
    return () => {
      unSub();
    };
  }, []);

  return (
    <div className={styles.content}>
      <Row>
        <Col xs={{ span: 24 }} md={{ span: 6, offset: 1 }}>
          <Card
            className={`${styles['card-style']} ${styles['card-minheight']}`}
            bordered={false}
            size="small"
          >
            <div className={styles['card-line']}>
              NODE MODE:{' '}
              <span>
                {health?.bootNodeMode
                  ? 'Boot Node'
                  : health?.fullNode
                  ? 'Full Node'
                  : 'Light Node'}
              </span>
            </div>
            <div className={styles['card-line']}>
              AGENT VERSION: <span>{health?.version}</span>
            </div>
            <div className={styles['card-line']}>
              NETWORK ID: <span>{addresses?.network_id}</span>
            </div>
          </Card>
        </Col>
        <Col xs={{ span: 24 }} md={{ span: 6, offset: 2 }}>
          <Card
            className={`${styles['card-style']} ${styles['card-minheight']}`}
            bordered={false}
            size="small"
          >
            <div className={styles['card-line']}>
              IPv4: <span>{addresses?.public_ip?.ipv4}</span>
            </div>
            <div className={styles['card-line']}>
              IPv6: <span>{addresses?.public_ip?.ipv6}</span>
            </div>
            <div className={styles['card-line']}>
              NAT ROUTE:{' '}
              <span>
                {addresses?.nat_route?.map((item, index) => {
                  return (
                    <span key={index} style={{ marginRight: 20 }}>
                      {item}
                    </span>
                  );
                })}
              </span>
            </div>
          </Card>
        </Col>
        <Col xs={{ span: 24 }} md={{ span: 6, offset: 2 }}>
          <Card
            className={`${styles['card-style']} ${styles['card-minheight']}`}
            bordered={false}
            size="small"
          >
            <div className={styles['card-line']}>
              Transferred: <span>{getSize(metrics.uploadTotal * 256, 1)}</span>
            </div>
            <div className={styles['card-line']}>
              Retrieved: <span>{getSize(metrics.downloadTotal * 256, 1)}</span>
            </div>
          </Card>
        </Col>
        <Col xs={{ span: 24 }} md={{ span: 22, offset: 1 }}>
          <Card className={styles['card-style']} bordered={false} size="small">
            <div className={styles['card-line']}>
              PUBLIC KEY: <span>{addresses?.public_key}</span>
            </div>
            <div className={styles['card-line']}>
              OVERLAY ADDRESS: <span>{addresses?.overlay}</span>
            </div>
            <div className={styles['card-line']}>
              UNDERLAY ADDRESS:
              <ul>
                {addresses?.underlay?.map((item, index) => {
                  return (
                    <li key={index}>
                      <span>{item}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

const Info: React.FC = () => {
  const { status } = useSelector((state: Models) => state.global);
  return <>{status ? <Main /> : <NotConnected />}</>;
};

export default Info;
