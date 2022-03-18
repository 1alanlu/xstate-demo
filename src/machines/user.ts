import { useActor } from '@xstate/vue';
import { createMachine, interpret } from 'xstate';

interface User {
  name: string;
  age: number;
}

interface Context {
  user?: User;
  error?: string;
}

type Event = { type: 'FETCH'; id: string } | { type: 'RESOLVE'; user: User } | { type: 'REJECT'; error: string };

type State =
  | {
      value: 'idle';
      context: Context & {
        user: undefined;
        error: undefined;
      };
    }
  | {
      value: 'loading';
      context: Context;
    }
  | {
      value: 'success';
      context: Context & { user: User; error: undefined };
    }
  | {
      value: 'failure';
      context: Context & { user: undefined; error: string };
    };

const userMachine = createMachine<Context, Event, State>({
  id: 'user',
  initial: 'idle',
  states: {
    idle: {
      /* ... */
    },
    loading: {
      /* ... */
    },
    success: {
      /* ... */
    },
    failure: {
      /* ... */
    },
  },
});

const service = interpret(userMachine).start();

// Create a custom service hook for this machine, that takes the service previously created. This way you don't have to import on every component the useService hook and the service created.
export const useUserMachine = () => {
  return useActor(service);
};
