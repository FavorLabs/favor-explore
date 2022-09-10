import React, { useEffect, useRef } from 'react';
import styles from './index.less';
import { Row, Col, Card, message } from 'antd';
import NotConnected from '@/components/notConnected';
import CopyText from '@/components/copyText';
import Keystore from '@/components/keystore';
import Speed from '@/components/speed';
import { useDispatch, useSelector } from 'umi';
import { Models } from '@/declare/modelType';

const Main: React.FC = () => {
  const dispatch = useDispatch();
  const { debugApi, health, topology, ws } = useSelector(
    (state: Models) => state.global,
  );
  const { addresses } = useSelector((state: Models) => state.info);
  const { account } = useSelector((state: Models) => state.accounting);

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
    // dispatch({
    //   type: 'info/getAddresses',
    //   payload: {
    //     url: debugApi,
    //   },
    // });
    getTopology();
    subKad();
    return () => {
      unSub();
    };
  }, []);

  return (
    <div className={`bold-font ${styles.content}`}>
      <Row>
        <Col className={styles['info-col']} xs={{ span: 24 }} md={{ span: 24 }}>
          <Card
            className={`${styles['card-style']} ${styles['card-minheight']}`}
            bordered={false}
            size="small"
          >
            <div className={styles['card-inner']}>
              <div className={styles['card-line']}>
                <p>NODE MODE</p>
                <span>
                  {health?.bootNodeMode
                    ? 'Boot Node'
                    : health?.fullNode
                    ? 'Full Node'
                    : 'Light Node'}
                </span>
              </div>
              <div className={styles['card-line']}>
                <p>AGENT VERSION</p>
                <span>{health?.version}</span>
              </div>
              <div className={styles['card-line']}>
                <p>NETWORK ID</p>
                <span>{addresses?.network_id}</span>
              </div>
            </div>
          </Card>
        </Col>
        <Col className={styles['info-col']} xs={{ span: 24 }} md={{ span: 24 }}>
          <Card
            className={`${styles['card-style']} ${styles['card-minheight']}`}
            bordered={false}
            size="small"
          >
            <div className={`${styles['card-inner']} ${styles['card-center']}`}>
              <div className={styles['card-line']}>
                <p>IPv4</p>
                <span>{addresses?.public_ip?.ipv4}</span>
              </div>
              <div className={styles['card-line']}>
                <p>IPv6</p>
                <span>{addresses?.public_ip?.ipv6}</span>
              </div>
              <div className={styles['card-line']}>
                <p>NAT ROUTE</p>
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
              <div className={styles['card-line-out']}>
                <div className={styles['card-line']}>
                  <p>PUBLIC KEY</p>
                  <span>{addresses?.public_key}</span>
                </div>
                <div
                  className={`${styles['card-line']} ${styles['remove-bot-mar']}`}
                >
                  <p>OVERLAY ADDRESS</p>
                  <span>{addresses?.overlay}</span>
                </div>
              </div>
              <div className={styles['card-line']}>
                <p>UNDERLAY ADDRESS</p>
                <ul style={{ padding: 0 }} className={styles.ul}>
                  {addresses?.underlay?.map((item, index) => {
                    return (
                      <li key={index}>
                        <span>{item}</span>
                      </li>
                    );
                  })}
                </ul>
                <div className={styles['account-export']}>
                  <div className={styles.title}>Account Address</div>
                  <div className={styles.account}>
                    <span style={{ marginRight: 10 }}>{account}</span>
                    <CopyText text={account} />
                    <div style={{ marginLeft: 10 }}>
                      <Keystore />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </Col>
        {/* <Col xs={{ span: 24 }} md={{ span: 6, offset: 2 }}>
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
        </Col> */}
      </Row>
      <div className={styles['speed-chart']}>
        {addresses?.overlay && <Speed />}
      </div>
    </div>
  );
};

const Info: React.FC = () => {
  const { status } = useSelector((state: Models) => state.global);
  return <>{status ? <Main /> : <NotConnected />}</>;
};

export default Info;
