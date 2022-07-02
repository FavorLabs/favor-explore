import React, { useState, useEffect } from 'react';
import styles from './index.less';
import { useDispatch, useSelector, useHistory, useLocation } from 'umi';
import { Button, Modal, Radio, RadioChangeEvent, Input, Popover } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import CopyText from '@/components/copyText';
import { Models } from '@/declare/modelType';
import { ethers } from 'ethers';
import {
  HomeOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
  PartitionOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { eventEmitter } from '@/utils/util';

const AccountAddress: React.FC = (props) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const history = useHistory();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSubModalVisible, setIsSubModalVisible] = useState(false);
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState(1);
  const { api, ws, refresh } = useSelector((state: Models) => state.global);
  const { account, trafficInfo, trafficCheques } = useSelector(
    (state: Models) => state.accounting,
  );

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleExport = () => {
    setIsModalVisible(false);
    showSubModal();
  };

  const showSubModal = () => {
    setIsSubModalVisible(true);
    console.log('showSubModal');
  };

  const handleSubCancel = () => {
    setIsSubModalVisible(false);
  };

  const handleConfirm = () => {
    console.log('Confirm');
  };

  const onChange = (e: RadioChangeEvent) => {
    // console.log('radio checked', e.target.value);
    setValue(e.target.value);
  };

  const getBalance = async () => {
    const provider = new ethers.providers.JsonRpcProvider(api + '/chain');
    const accounts = await provider.listAccounts();
    const account = accounts[0];
    dispatch({
      type: 'accounting/setAccount',
      payload: {
        account,
      },
    });
    // const balance = await provider.getBalance(account);
    // const bnb = ethers.utils.formatEther(balance);
    // setBalance(bnb);
  };

  const hide = () => {
    setVisible(false);
  };

  const handleVisibleChange = (newVisible: boolean) => {
    setVisible(newVisible);
  };

  const MenuItem = [
    // {
    //   key: '/',
    //   icon: <HomeOutlined style={{ fontSize: '1rem', verticalAlign: 'middle', marginRight: '.3rem' }}/>,
    //   label: 'home',
    // },
    {
      key: '/info',
      icon: (
        <InfoCircleOutlined
          style={{
            fontSize: '1rem',
            verticalAlign: 'middle',
            marginRight: '.3rem',
          }}
        />
      ),
      label: 'Info',
    },
    {
      key: '/peers',
      icon: (
        <PartitionOutlined
          style={{
            fontSize: '1rem',
            verticalAlign: 'middle',
            marginRight: '.3rem',
          }}
        />
      ),
      label: 'Peers',
    },
    {
      key: '/files',
      icon: (
        <FileTextOutlined
          style={{
            fontSize: '1rem',
            verticalAlign: 'middle',
            marginRight: '.3rem',
          }}
        />
      ),
      label: 'Files',
    },
    {
      key: '/setting',
      icon: (
        <SettingOutlined
          style={{
            fontSize: '1rem',
            verticalAlign: 'middle',
            marginRight: '.3rem',
          }}
        />
      ),
      label: 'Settings',
    },
  ];

  const switchPage = (path: string) => {
    history.push(path);
    // if (getScreenWidth() < screenBreakpoint.xl) {
    //   setCollapsed(true);
    // }
  };

  useEffect(() => {
    getBalance();
  }, []);

  return (
    <div className={styles.content}>
      {/* <Button
        type="primary"
        size="small"
        style={{ height: '2rem' }}
        onClick={() => {
          console.log('click');
          showModal();
        }}
      >
        Account
      </Button> */}
      <Popover
        placement="bottomRight"
        title={null}
        content={
          <div className="menu-list">
            <ul
              style={{
                listStyle: 'none',
                display: 'flex',
                maxWidth: '13rem',
                flexWrap: 'wrap',
              }}
            >
              {MenuItem.map((item, index) => (
                <li
                  style={{
                    marginRight: '1rem',
                    marginBottom: '.8rem',
                    flexShrink: 0,
                  }}
                  key={index}
                  onClick={() => {
                    hide();
                    if (item.key === '/setting') {
                      eventEmitter.emit('changeSettingModal', true);
                      return;
                    }
                    switchPage(item.key);
                  }}
                >
                  <div>
                    {item.icon}
                    {/* <span className='icon iconfont icon-caidan' style={{ fontSize: '1.5rem', verticalAlign: 'middle', marginRight: '.2rem' }}></span> */}
                    <span>{item.label}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        }
        trigger="click"
        visible={visible}
        onVisibleChange={handleVisibleChange}
      >
        <span className="icon iconfont icon-caidan menu-m"></span>
      </Popover>
      <Modal
        title="Account Address"
        visible={isModalVisible}
        onCancel={handleCancel}
        maskClosable={false}
        centered={true}
        footer={[
          <Button key="ok" type="primary" onClick={handleCancel}>
            ok
          </Button>,
          <Button key="export" type="primary" onClick={handleExport}>
            export
          </Button>,
        ]}
        style={{ color: '#000' }}
      >
        <p style={{ color: '#666' }}>
          {account + ' '}
          {/* <CopyOutlined style={{ fontSize: '1rem' }} /> */}
          <CopyText text={account} />
        </p>
      </Modal>
      <Modal
        title="Password"
        visible={isSubModalVisible}
        onCancel={handleSubCancel}
        maskClosable={false}
        centered={true}
        footer={[
          <Button key="cancel" type="primary" onClick={handleSubCancel}>
            Cancel
          </Button>,
          <Button key="confirm" type="primary" onClick={handleConfirm}>
            Confirm
          </Button>,
        ]}
        style={{ color: '#000' }}
      >
        <Radio.Group onChange={onChange} value={value}>
          <Radio value={1}>keystore</Radio>
          <Radio value={2}>private</Radio>
        </Radio.Group>
        <Input
          placeholder="Please enter your password"
          style={{ marginTop: '1rem' }}
        />
      </Modal>
    </div>
  );
};

export default AccountAddress;
