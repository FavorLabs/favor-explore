export const defaultApi: string = 'https://test-node.favorlabs.io:1603';
export const sessionStorageApi: string = 'api_host';
export const time = 3e4; // refresh time
export const speedTime = 5000;

export const faucet: Record<number, string> = {
  19: 'https://faucet.polygon.technology/',
};

export const getFaucet = (network_id: number): string => {
  return faucet[network_id];
};
