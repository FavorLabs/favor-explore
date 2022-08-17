import React, { useEffect, useRef, useState } from 'react';
import styles from './index.less';
import { useSelector, useDispatch } from 'umi';
import { Models } from '@/declare/modelType';
import { Button, Table, Modal, message, Tooltip } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { Cheque } from '@/declare/api';
import { trafficToBalance, isPC } from '@/utils/util';
import Api from '@/api/api';

type Props = {
  data: Cheque[];
};

const CashOut: React.FC<Props> = (props) => {
  const { data } = props;
  const dispatch = useDispatch();
  const [overlay, setOverlay] = useState<Cheque>({
    peer: '',
    outstandingTraffic: 0,
    sentSettlements: 0,
    receivedSettlements: 0,
    total: 0,
    unCashed: 0,
    status: 0,
    cashLoad: false,
    index: 0,
  });
  const { ws, api } = useSelector((state: Models) => state.global);
  const { cashOutList } = useSelector((state: Models) => state.accounting);

  const [visible, setVisible] = useState(false);
  const [isAll, setIsAll] = useState(false);
  const [cashOutAllDisabled, setCashOutAllDisabled] = useState(false);
  const [cashOutDisabled, setCashOutDisabled] = useState(false);
  const [isCancel, setIsCancel] = useState(false);
  const [cashOutStatus, setCashOutStatus] = useState(false);

  const subResult = useRef({
    cashOut: {
      id: 43,
      result: '',
    },
  }).current;

  const clickHandle = (overlay: Cheque): void => {
    setVisible(false);
    cashOut(overlay);
  };

  const clickAllHandle = () => {
    if (data) {
      let arr = data.filter((item) => item.unCashed > 0 && item.status === 0);
      setVisible(false);
      setIsCancel(true);
      cashOutAll(arr);
    }
  };

  const clickAllBtn = () => {
    if (isCancel) {
      setCashOutStatus(false);
      setIsCancel(false);
      setCashOutAllDisabled(true);
      // console.log('CashOutAllDisabled', cashOutAllDisabled);
      // restoreCashOutState();
    } else {
      setVisible(true);
      setIsAll(true);
    }
  };

  const cashOut = async (overlay: Cheque) => {
    setCashOutStatus(true);
    dispatch({
      type: 'accounting/setCashOutList',
      payload: {
        cashOutList: [overlay],
      },
    });
  };

  const cashOutAll = async (overlayArr: Cheque[]) => {
    setCashOutStatus(true);
    dispatch({
      type: 'accounting/setCashOutList',
      payload: {
        cashOutList: overlayArr,
      },
    });
    console.log(cashOutList);
  };

  const listenCashOutList = async () => {
    if (!cashOutStatus) {
      restoreCashOutState();
      return;
    }
    if (cashOutList.length) {
      if (isAll) {
        setCashOutDisabled(true);
      } else {
        setCashOutDisabled(true);
        setCashOutAllDisabled(true);
      }
      let option = cashOutList[0];
      let overlay = option?.peer;
      let index = option?.index;
      try {
        dispatch({
          type: 'accounting/setSingleCashLoad',
          payload: {
            index,
            status: true,
          },
        });
        await subCashOut(overlay, index);
        await Api.cashOut(api, overlay);
      } catch (e: any) {
        let err = e?.message ? JSON.parse(e.message).message : e;
        message.error({
          content: JSON.stringify(err),
          duration: 4,
        });
        dispatch({
          type: 'accounting/setSingleCashLoad',
          payload: {
            index,
            status: false,
          },
        });
        ws?.removeAllListeners(subResult.cashOut.result);
        setTimeout(() => {
          // console.log('catch setTimeout');
          let deepCloneTem = JSON.parse(JSON.stringify(cashOutList));
          dispatch({
            type: 'accounting/setCashOutList',
            payload: {
              cashOutList: deepCloneTem.splice(1),
            },
          });
        }, 5000);
      }
    } else {
      restoreCashOutState();
    }
  };

  const subCashOut = (overlay: any, idx: any) => {
    return new Promise((resolve, reject) => {
      ws?.send(
        {
          id: subResult.cashOut.id + overlay,
          jsonrpc: '2.0',
          method: 'traffic_subscribe',
          params: ['cashOut', [overlay]],
        },
        (err, res) => {
          if (err || res?.error) {
            // message.error(err || res?.error);
            reject(err || res?.error);
          }
          // console.log('start sub overlay');
          subResult.cashOut.result = res?.result;

          // let setT = setTimeout(()=>{
          //   unSubCashOut(subResult.cashOut.id+overlay);
          //   dispatch({
          //     type: 'accounting/setSingleCashLoad',
          //     payload: {
          //       index: idx,
          //       status: false
          //     }
          //   })
          //   let deepCloneTem = JSON.parse(JSON.stringify(cashOutList));
          //   dispatch({
          //     type: 'accounting/setCashOutList',
          //     payload: {
          //       cashOutList: deepCloneTem.splice(1)
          //     }
          //   })
          // },60000)

          ws?.once(
            res?.result,
            async (res: { overlay: string; status: boolean }[]) => {
              console.log(res);
              // clearTimeout(setT);
              // unSubCashOut(subResult.cashOut.id+overlay);
              res.forEach((item) => {
                if (item.status) {
                  message.success({
                    content: item.overlay + ' ' + 'cashout success',
                    duration: 2,
                  });
                  let deepCloneTem = JSON.parse(JSON.stringify(cashOutList));
                  dispatch({
                    type: 'accounting/setCashOutList',
                    payload: {
                      cashOutList: deepCloneTem.splice(1),
                    },
                  });
                  // dispatch({
                  //   type: 'accounting/setSingleCashLoad',
                  //   payload: {
                  //     index: idx,
                  //     status: false
                  //   }
                  // })
                  dispatch({
                    type: 'accounting/resetUnCashed',
                    payload: {
                      index: idx,
                    },
                  });
                } else {
                  message.error({
                    content: item.overlay + ' ' + 'cashout failed',
                    duration: 2,
                  });
                  dispatch({
                    type: 'accounting/setSingleCashLoad',
                    payload: {
                      index: idx,
                      status: false,
                    },
                  });

                  setTimeout(() => {
                    let deepCloneTem = JSON.parse(JSON.stringify(cashOutList));
                    dispatch({
                      type: 'accounting/setCashOutList',
                      payload: {
                        cashOutList: deepCloneTem.splice(1),
                      },
                    });
                  }, 5000);
                }
              });
            },
          );
          resolve(res);
        },
      );
    });
  };

  const unSubCashOut = (id: number) => {
    return new Promise((resolve, reject) => {
      ws?.send(
        {
          id: id,
          jsonrpc: '2.0',
          method: 'traffic_unsubscribe',
          params: [subResult.cashOut.result],
        },
        (err, res) => {
          // console.log(err, res);
          if (err || res?.error) {
            reject(err || res?.error);
          } else {
            resolve(res);
          }
        },
      );
    });
  };

  const restoreCashOutState = () => {
    setCashOutStatus(false);
    setIsAll(false);
    setIsCancel(false);
    setCashOutAllDisabled(false);
    setCashOutDisabled(false);
  };

  useEffect(() => {
    setCashOutStatus(false);
    return () => {
      setCashOutStatus(false);
    };
  }, []);

  useEffect(() => {
    listenCashOutList();
  }, [cashOutList]);

  const columns: ColumnsType<Cheque> = [
    {
      title: <div className={styles.head}>Index</div>,
      key: 'Index',
      render: (text, record, index) => index + 1,
      width: 50,
    },
    {
      title: 'Peers',
      dataIndex: 'peer',
      render: (text, record, index) => {
        return isPC() ? (
          <div className={styles.peers}>{record.peer}</div>
        ) : (
          <Tooltip placement="topLeft" title={record.peer}>
            <div className={styles.peers}>{record.peer}</div>
          </Tooltip>
        );
      },
      width: isPC() ? 550 : 50,
    },
    {
      title: (
        <>
          <div>Outstanding</div>
          <div>Balance</div>
        </>
      ),
      render: (value, record, index) => {
        return trafficToBalance(record.outstandingTraffic);
      },
      align: 'center',
    },
    {
      title: (
        <>
          <div>Settlements</div>
          <div>Sent/Received</div>
        </>
      ),
      render: (value, record, index) => {
        return (
          <div style={{ textAlign: 'left', position: 'relative', left: 15 }}>
            <div>
              <span>-</span>
              {trafficToBalance(record.sentSettlements)}&nbsp;/
            </div>
            <div>{trafficToBalance(record.receivedSettlements)}</div>
          </div>
        );
      },
      align: 'center',
    },
    {
      title: 'Total',
      render: (value, record, index) => {
        return trafficToBalance(record.total);
      },
      align: 'center',
    },
    {
      title: (
        <>
          <div>Uncashed</div>
          <div>Amount</div>
        </>
      ),
      render: (value, record, index) => {
        return trafficToBalance(record.unCashed);
      },
      align: 'center',
    },
    {
      title: 'cashout',
      render: (value, record, index) => {
        return (
          <div>
            {record.unCashed ? (
              <>
                <Button
                  className="cashout-btn"
                  onClick={() => {
                    setOverlay(record);
                    setVisible(true);
                    setIsAll(false);
                  }}
                  loading={record.cashLoad}
                  disabled={cashOutDisabled}
                >
                  cashout
                </Button>
              </>
            ) : (
              <></>
            )}
          </div>
        );
      },
      align: 'center',
      width: 120,
    },
  ];
  return (
    <>
      <div style={{ textAlign: 'right', marginBottom: 10 }}>
        <Button
          type="text"
          className={`${styles['withdraw']} bold-font`}
          onClick={clickAllBtn}
          disabled={cashOutAllDisabled}
        >
          {isCancel ? 'cancel' : 'Withdraw all'}
        </Button>
      </div>
      <Table<Cheque>
        className={styles.list}
        dataSource={data}
        columns={columns}
        pagination={false}
        rowKey={(item) => item.peer}
        locale={{ emptyText: 'No Data' }}
      />
      <Modal
        title={null}
        centered
        visible={visible}
        closable={false}
        maskClosable={false}
        footer={null}
        // onOk={(e) => {
        //   isAll ? clickAllHandle() : clickHandle(overlay);
        // }}
        // onCancel={() => {
        //   setVisible(false);
        // }}
        className={styles['withdraw-modal']}
      >
        <p className={`${styles.title} bold-font`}>Cashout</p>
        <div className={styles.tips}>
          Are you sure to cashout {isAll ? 'all' : ''} the coin?
        </div>
        <div className={styles.btns}>
          <Button onClick={() => setVisible(false)}>Cancel</Button>
          <Button
            disabled={data ? false : true}
            onClick={() => {
              isAll ? clickAllHandle() : clickHandle(overlay);
            }}
          >
            OK
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default CashOut;
