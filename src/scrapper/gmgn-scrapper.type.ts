export interface GmGnAiResponse<T> {
  code: number;
  msg: string;
  data?: T;
}

export interface GmGnAiTrending {
  id?: number;
  chain?: string;
  address?: string;
  symbol?: string;
  logo?: string;
  price?: number;
  price_change_percent?: number;
  swaps?: number;
  volume?: number;
  liquidity?: number;
  market_cap?: number;
  hot_level?: number;
  pool_creation_timestamp?: number;
  holder_count?: number;
  twitter_username?: string;
  website?: string;
  telegram?: string;
  open_timestamp?: number;
  price_change_percent1m?: number;
  price_change_percent5m?: number;
  price_change_percent1h?: number;
  buys?: number;
  sells?: number;
  initial_liquidity?: number;
  is_show_alert: boolean;
  top_10_holder_rate?: number;
  renounced_mint?: number;
  renounced_freeze_account?: number;
  burn_ratio?: string;
  burn_status?: string;
  launchpad: any;
  dev_token_burn_amount: any;
  dev_token_burn_ratio: any;
  dexscr_ad?: number;
  dexscr_update_link?: number;
  cto_flag?: number;
  twitter_change_flag?: number;
  creator_token_status?: string;
  creator_close: boolean;
  launchpad_status?: number;
  rat_trader_amount_rate?: number;
  bluechip_owner_percentage?: number;
  smart_degen_count?: number;
  renowned_count?: number;
}

export interface GmGnAiTrendingRank {
  rank: Array<GmGnAiTrending>;
}
