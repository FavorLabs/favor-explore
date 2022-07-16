export const defaultApi: string = 'http://localhost:1633';
export const sessionStorageApi: string = 'api_host';
export const time = 3e4; // refresh time
export const speedTime = 5000;

export const faucet: Record<number, string> = {
  19: 'https://faucet.polygon.technology/',
  20: 'https://faucet.metissafe.tech/',
  21: 'https://www.okx.com/cn/okc/faucet',
};

export const getFaucet = (network_id: number): string => {
  return faucet[network_id] || faucet[19];
};
