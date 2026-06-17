export interface Channel {
  id: string;
  name: string;
  logo: string;
  group: string;
  country: string;
  language: string;
  url: string;
}

export interface ChannelsApiResponse {
  success: boolean;
  country: string;
  m3uUrl: string;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  groups: string[];
  channels: Channel[];
}

export interface CountriesApiResponse {
  success: boolean;
  countries: CountryItem[];
}

export interface CountryItem {
  code: string;
  name: string;
}
