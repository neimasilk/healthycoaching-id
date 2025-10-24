declare module 'react-native-sqlite-storage' {
  export interface SQLiteResultSet {
    insertId?: number | null;
    rowsAffected: number;
    rows: {
      length: number;
      item<T = any>(index: number): T;
    };
  }

  export interface SQLiteResultSetError extends Error {
    code?: string | number;
  }

  export interface SQLiteTransaction {
    executeSql(
      sqlStatement: string,
      args?: any[],
      callback?: (transaction: SQLiteTransaction, resultSet: SQLiteResultSet) => void,
      errorCallback?: (transaction: SQLiteTransaction, error: SQLiteResultSetError) => boolean | void
    ): void;
  }

  export interface SQLiteDatabase {
    executeSql(
      sqlStatement: string,
      args?: any[],
      callback?: (transaction: SQLiteTransaction, resultSet: SQLiteResultSet) => void,
      errorCallback?: (transaction: SQLiteTransaction, error: SQLiteResultSetError) => boolean | void
    ): Promise<SQLiteResultSet>;
    transaction(
      callback: (transaction: SQLiteTransaction) => void,
      errorCallback?: (error: SQLiteResultSetError) => void,
      successCallback?: () => void
    ): void;
    close(): Promise<void>;
  }

  export function openDatabase(config: {
    name: string;
    location?: 'default' | 'Library' | 'Documents';
    createFromLocation?: number;
    readOnly?: boolean;
  }): Promise<SQLiteDatabase>;
}
