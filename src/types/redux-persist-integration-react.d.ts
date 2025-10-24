declare module 'redux-persist/integration/react' {
  import type React from 'react';
  import type { Persistor } from 'redux-persist';

  export interface PersistGateProps {
    loading?: React.ReactNode;
    persistor: Persistor;
    children?: React.ReactNode;
  }

  export class PersistGate extends React.Component<PersistGateProps> {}
}
