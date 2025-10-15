export type ChannelActivityRecencyBand = {
  color: string;
  maxAgeMs?: number;
};

export interface TrackerConfig {
  social: {
    channels: string[];
    states: string[];
  };
  channelActivity: {
    recencyBands: ChannelActivityRecencyBand[];
  };
}
