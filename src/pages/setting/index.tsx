import React, { useState } from 'react';
import { useSelector, useDispatch } from 'umi';
import styles from './index.less';
import SettingApi from '@/components/settingApi';
import { Button } from 'antd';
import { sessionStorageApi } from '@/config/url';
import { checkSession } from '@/utils/util';
import { Models } from '@/declare/modelType';
import FavorConfigEdit from '@/components/favorConfigEdit';

const Setting: React.FC = (props) => {
  const dispatch = useDispatch();

  const { api, status, electron, ws } = useSelector(
    (state: Models) => state.global,
  );

  const [apiValue, setApiValue] = useState<string>(
    checkSession(sessionStorageApi) || api || '',
  );

  const saveApi = (): void => {
    sessionStorage.setItem(sessionStorageApi, apiValue.trim());
    if (!status || api !== apiValue.trim()) {
      ws?.disconnect();
      dispatch({
        type: 'global/getStatus',
        payload: {
          api: apiValue.trim(),
        },
      });
      dispatch({
        type: 'global/initMetrics',
      });
    }
  };

  return (
    <>
      {electron ? (
        <>{<FavorConfigEdit />}</>
      ) : (
        <>
          <div className={styles.api}>
            <SettingApi
              value={apiValue.trim()}
              title={'API Endpoint'}
              fn={setApiValue}
              saveApi={saveApi}
            />
          </div>
          <div style={{ marginTop: '50px' }}>
            <Button size={'large'} onClick={saveApi}>
              <span style={{ letterSpacing: '2px', padding: '0 20px' }}>
                Connect
              </span>
            </Button>
          </div>
        </>
      )}
    </>
  );
};

export default Setting;
