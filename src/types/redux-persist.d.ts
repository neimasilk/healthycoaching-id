declare module 'redux-persist' {
  import type { Reducer, AnyAction, StoreEnhancer } from 'redux';

  export interface PersistConfig<S> {
    key: string;
    storage: any;
    whitelist?: Array<keyof S>;
    blacklist?: Array<keyof S>;
  }

  export interface Persistor {
    purge(): Promise<void>;
    flush(): Promise<void>;
    pause(): void;
    persist(): void;
  }

  export function persistReducer<S, A extends AnyAction = AnyAction>(
    config: PersistConfig<S>,
    reducer: Reducer<S, A>
  ): Reducer<S, A>;

  export function persistStore(store: any): Persistor;

  export function autoRehydrate(): StoreEnhancer;
}
