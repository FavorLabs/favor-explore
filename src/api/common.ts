import axios from 'axios';
import { isConnected } from './api';
import { getHealth } from './debugApi';

export const isStatus = (api: string, debugApi: string): Promise<any> => {
  return axios.all([isConnected(api), getHealth(debugApi)]);
};
