import axios from "axios";

declare module "axios" {
  interface AxiosInstance {
    fetcher: (url: string) => Promise<any>;
  }
}
