import { configureStore, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type Middleware } from '@reduxjs/toolkit';

type StoreEvent = "updated" | "itemUpdated" | "itemRemoved" | "itemInserted";

export class StoreManager {
  static #_stores = new Map<string, Store>();

  static initStore = (name: string, initial: any, key?: string) => {
    if (!this.existed(name)) {
      const store = new Store(name, initial, key);
      this.#_stores.set(name, store);
    }
  };

  static getStore(store_name: string) {
    return this.#_stores.get(store_name);
  }

  static existed(store_name: string) {
    return this.#_stores.has(store_name);
  }
}

export class Store {
  #key;
  #name;
  #manager;
  #actions;
  #listeners = new Map<string, Set<Function>>();

  constructor(name: string, initial: any, key?: string) {
    this.#key = key || "id";
    this.#name = name;

    const storeSlice = createSlice({
      name,
      initialState: initial,
      reducers: Store.getReducers(this.#key)
    });

    this.#manager = configureStore({
      reducer: {
        [name]: storeSlice.reducer,
      },
      middleware: (getDefaultMiddleware) => getDefaultMiddleware({

      }).concat(((): Middleware => () => (next: any) => (action: any) => {
        const result = next(action);
        if (action.type === `${this.#name}/itemInserted`) {
          this.#emit("itemInserted", action.payload);
        }

        if (action.type === `${this.#name}/itemUpdated`) {
          this.#emit("itemUpdated", action.payload);
        }

        if (action.type === `${this.#name}/itemRemoved`) {
          this.#emit("itemRemoved", action.payload);
        }

        if (action.type === `${this.#name}/updated`) {
          this.#emit("updated", action.payload);
        }

        return result;
      })())
    });

    this.#actions = storeSlice.actions;
  }

  /**
   * @desc Get current state
   */
  current() {
    return this.#manager.getState()[this.#name];
  }

  getItem(item_key: string) {
    if (Array.isArray(this.current())) {
      return this.current().find((item: any) => item[this.#key] == item_key);
    }

    return null;
  }

  /**
   * @desc Update state
   * @param updated 
   */
  update(updated: any) {
    this.#manager.dispatch(this.#actions.updated(updated));
  }

  /**
   * @desc For collection: update item state
   * @param item 
   */
  updateItem(item: any) {
    this.#manager.dispatch(this.#actions.itemUpdated(item));
  }

  insertItem(item: any) {
    this.#manager.dispatch(this.#actions.itemInserted(item));
  }

  removeItem(item: any) {
    this.#manager.dispatch(this.#actions.itemRemoved(item));
  }

  watch(event: StoreEvent, handle: Function) {
    let event_listeners = this.#listeners.get(event) ?? new Set<Function>();
    event_listeners.add(handle);
    this.#listeners.set(event, event_listeners);
  }

  #emit(action: any, payload: any) {
    this.#listeners.get(action)?.forEach(handler => handler(payload));
  }

  private static getReducers = (key: string) => {
    return {
      itemInserted: (state: any[], action: PayloadAction<any>) => {
        state.push(action.payload);
      },
      itemUpdated: (state: any[], action: PayloadAction<any>) => {
        const index = state.findIndex(item => item[key] === action.payload[key]);
        if (index > -1) {
          state[index] = action.payload;
        }
      },
      itemRemoved: (state: any[], action: PayloadAction<any>) => {
        return state.filter(item => item[key] !== action.payload[key]);
      },
      updated: (state: any, action: PayloadAction<any>) => {
        if (Array.isArray(state)) {
          return action.payload;
        }

        return { ...state, ...action.payload };
      },
    };
  };
}

export default StoreManager;