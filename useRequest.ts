import axios, { AxiosRequestConfig, Method } from "axios";
import { useEffect, useState } from "react";

interface IOptions extends Omit<AxiosRequestConfig<any>, "url"> {}

interface IState<IResult> {
  data?: IResult | null;
  error?: unknown | null;
  loading?: boolean;
}

type TCustomWindow<IResult> = Window &
  typeof globalThis & {
    cachedAPIs?: {
      [requestURL: string]: IResult;
    };
  };

export const useRequest = <IResult>(requestURL: string, options?: IOptions) => {
  const [requestData, setRequestData] = useState<IState<IResult>>({
    data: null,
    error: null,
    loading: false,
  });

  const method = options?.method || "get";

  const callApi = async (isRetry?: boolean) => {
    try {
      const customWindow = window as TCustomWindow<IResult>;

      if (
        !isRetry &&
        method === "get" &&
        customWindow.cachedAPIs &&
        customWindow.cachedAPIs[requestURL]
      ) {
        setRequestData({
          data: customWindow.cachedAPIs[requestURL],
          error: null,
          loading: false,
        });

        return;
      }

      setRequestData({ data: null, error: null, loading: true });

      const { data } = await axios<IResult>({
        ...options,
        url: requestURL,
        method,
      });

      setRequestData({ data, error: null, loading: false });

      if (method !== "get") return;

      if (!customWindow.cachedAPIs) {
        customWindow.cachedAPIs = { [requestURL]: data };
      } else {
        customWindow.cachedAPIs[requestURL] = data;
      }
    } catch (error) {
      setRequestData({ error, data: null, loading: false });
    }
  };

  useEffect(() => {
    callApi();
  }, []);

  const retry = () => {
    callApi(true);
  };

  return {
    data: requestData.data,
    error: requestData.error,
    loading: requestData.loading,
    retry,
  };
};

// useRequest<{name: string}>("/url")

// axios({url: "",})

const { data, error, loading, retry } = useRequest<{ name: string }>(
  "/url",
  {}
);
