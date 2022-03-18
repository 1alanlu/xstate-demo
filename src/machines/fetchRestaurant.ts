import { useActor } from '@xstate/vue';
import type { MachineConfig, MachineOptions, StateNode } from 'xstate';
import { assign, createMachine, interpret } from 'xstate';

/* ----------------------------------------------------------------
  * Other
---------------------------------------------------------------- */
interface Restaurant {
  id: number;
  name: string;
  rating: number;
  review: string;
}

const restaurants: Restaurant[] = [
  {
    id: 1,
    name: 'BBQ Unleashed',
    rating: 4.5,
    review: 'Dayum good sauce! Praise the Lord Almighty!',
  },
  {
    id: 2,
    name: 'Apollo Restaurant',
    rating: 5,
    review: 'True quality meets true gluttony! They recommend you buy a soda to offset the price of meats!',
  },
  {
    id: 3,
    name: "Nick's Pizza",
    rating: 3.5,
    review: "Very bready pizza, which means it's filling, but you're going to need a beverage to swallow it down!",
  },
  {
    name: 'Good Burger',
    rating: 1,
    review: 'Home of the good burger, can I take your order?',
    id: 4,
  },
];

const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
export const fetchRestaurants = async (): Promise<Restaurant[]> => {
  await sleep(1000);

  if (Math.random() < 0.5) {
    throw new Error('Could not fetch restaurants');
  }

  return restaurants;
};

/* ----------------------------------------------------------------
  * Context
---------------------------------------------------------------- */
interface FetchContext {
  restaurants?: Restaurant[];
  error?: Error;
}

/* ----------------------------------------------------------------
  * States
---------------------------------------------------------------- */
interface FetchStates {
  states: {
    initial: StateNode;
    ready: StateNode;
    loading: StateNode;
    success: StateNode;
    failure: StateNode;
  };
}

type FetchTypedStates = InitialState | ReadyState | LoadingState | SuccessState | FailureState;
interface InitialState {
  value: 'initial';
  context: FetchContext & { restaurants: undefined; error: undefined };
}
interface ReadyState {
  value: 'ready';
  context: FetchContext & { restaurants: Restaurant[]; error: undefined };
}
interface LoadingState {
  value: 'loading';
  context: FetchContext & { restaurants: Restaurant[]; error: undefined };
}
interface SuccessState {
  value: 'success';
  context: FetchContext & { restaurants: Restaurant[]; error: undefined };
}
interface FailureState {
  value: 'failure';
  context: FetchContext & { restaurants: undefined; error: Error };
}

/* ----------------------------------------------------------------
  * Event
---------------------------------------------------------------- */
type FetchEvent = FETCH_EVENT | RETRY_EVENT;
interface FETCH_EVENT {
  type: 'FETCH';
}
interface RETRY_EVENT {
  type: 'RETRY';
}

/* ----------------------------------------------------------------
  * MachineConfig
---------------------------------------------------------------- */
export const fetchMachineConfig: MachineConfig<FetchContext, FetchStates, FetchEvent> = {
  id: 'fetch',
  context: {
    restaurants: undefined,
    error: undefined,
  },
  initial: 'initial',
  states: {
    initial: {
      on: { FETCH: 'loading' },
    },
    ready: {
      on: { FETCH: 'loading' },
    },
    loading: {
      entry: assign({
        restaurants: (context, _event) => context.restaurants || [],
        error: (_context, _event) => undefined,
      }),
      invoke: {
        id: 'fetchRestaurants',
        src: 'fetchRestaurants',
        onDone: {
          target: 'success',
          actions: assign({
            restaurants: (_context, event) => event.data,
          }),
        },
        onError: {
          target: 'failure',
          actions: assign({
            restaurants: (_context, _event) => undefined,
            error: (_context, event) => event.data,
          }),
        },
      },
    },
    success: {
      after: { 2500: 'ready' },
    },
    failure: {
      on: { RETRY: 'loading' },
    },
  },
};

/* ----------------------------------------------------------------
  * MachineOptions
---------------------------------------------------------------- */
const fetchMachineOptions: Partial<MachineOptions<FetchContext, FetchEvent>> = {
  actions: {},
  guards: {},
  services: {
    fetchRestaurants,
  },
};

/* ----------------------------------------------------------------
  * Machine
---------------------------------------------------------------- */
export const fetchMachine = createMachine<FetchContext, FetchEvent, FetchTypedStates>(
  fetchMachineConfig,
  fetchMachineOptions
);

/* ----------------------------------------------------------------
  * MachineService
---------------------------------------------------------------- */
export const fetchMachineService = interpret(fetchMachine, { devTools: true }).start();

/* ----------------------------------------------------------------
  * useMachine
  Create a custom service hook for this machine, that takes the service previously created.
  This way you don't have to import on every component the useService hook and the service created.
---------------------------------------------------------------- */
export const useFetchMachine = () => {
  return useActor(fetchMachineService);
};
