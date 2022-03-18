import { useActor } from '@xstate/vue';
import type { MachineConfig, MachineOptions, StateNode } from 'xstate';
import { assign, createMachine, interpret } from 'xstate';

const router = useRouter();

/* ----------------------------------------------------------------
  * Other
---------------------------------------------------------------- */
const isTokenValid = (): boolean => true;
const logOutUser = () => {
  // do something
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const logInUser = (login: AuthContext['login']) => new Promise((resolve, reject) => {});
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const fetchUser = () => new Promise((resolve, reject) => {});

interface User {
  name: string;
}

/* ----------------------------------------------------------------
  * Context
---------------------------------------------------------------- */
interface AuthContext {
  user: User | null;
  login: {
    email: string;
    password: string;
  };
}

/* ----------------------------------------------------------------
  * States
---------------------------------------------------------------- */
interface AuthStates {
  states: {
    initAuth: StateNode;
    fetchingUser: StateNode;
    loggingInUser: StateNode;
    loggedIn: StateNode;
    loggedOut: StateNode;
  };
}

type AuthTypedStates = initAuthState | fetchingUserState | loggingInUserState | loggedInState | loggedOutState;
interface initAuthState {
  value: 'initAuth';
  context: AuthContext & { user: null };
}
interface fetchingUserState {
  value: 'fetchingUser';
  context: AuthContext & { user: null };
}
interface loggingInUserState {
  value: 'loggingInUser';
  context: AuthContext & { user: null };
}
interface loggedInState {
  value: 'loggedIn';
  context: AuthContext & { user: User };
}
interface loggedOutState {
  value: 'loggedOut';
  context: AuthContext & { user: null };
}

/* ----------------------------------------------------------------
  * Event
---------------------------------------------------------------- */
type AuthEvent = LOG_OUT_EVENT | LOG_IN_FORM_SUBMIT_EVENT | FETCH_USER_EVENT;
interface LOG_OUT_EVENT {
  type: 'LOG_OUT';
}
interface LOG_IN_FORM_SUBMIT_EVENT {
  type: 'LOG_IN_FORM.submit';
  login: { email: string; password: string };
}
interface FETCH_USER_EVENT {
  type: 'FETCH_USER';
  data: { data: { data: User } };
}

/* ----------------------------------------------------------------
  * MachineConfig
---------------------------------------------------------------- */
export const authMachineConfig: MachineConfig<AuthContext, AuthStates, AuthEvent> = {
  context: {
    user: null,
    login: {
      email: '',
      password: '',
    },
  },
  initial: 'initAuth',
  states: {
    initAuth: {
      always: [
        {
          cond: 'shouldFetchUser',
          target: 'fetchingUser',
        },
        {
          target: 'loggedOut',
        },
      ],
    },
    fetchingUser: {
      invoke: {
        id: 'fetchUser',
        src: 'fetchUser',
        onDone: {
          target: 'loggedIn',
          actions: 'assignUser',
        },
        onError: {
          target: 'loggedOut',
        },
      },
    },
    loggingInUser: {
      invoke: {
        id: 'logInUser',
        src: 'logInUser',
        onDone: {
          target: 'loggedIn',
          actions: 'assignUser',
        },
        onError: { target: 'loggedOut' },
      },
    },
    loggedIn: {
      on: {
        LOG_OUT: {
          actions: ['logOutUser'],
          target: 'loggedOut',
        },
      },
    },
    loggedOut: {
      exit: ['goToAccountIndex'],
      on: {
        'LOG_IN_FORM.submit': {
          actions: 'assignLogin',
          target: 'loggingInUser',
        },
      },
    },
  },
};

/* ----------------------------------------------------------------
  * MachineOptions
---------------------------------------------------------------- */
const authMachineOptions: Partial<MachineOptions<AuthContext, AuthEvent>> = {
  actions: {
    assignUser: assign({
      user: (_, event) => {
        if (event.type === 'FETCH_USER') {
          return event.data.data.data;
        } else {
          return null;
        }
      },
    }),
    assignLogin: assign({
      login: (_, event) => {
        if (event.type === 'LOG_IN_FORM.submit') {
          return event.login;
        } else {
          return { email: '', password: '' };
        }
      },
    }),
    goToAccountIndex: () => {
      router.push({ path: '/account' });
    },
    logOutUser,
  },
  guards: {
    shouldFetchUser: () => !document.location.pathname.includes('login') && isTokenValid(),
  },
  services: {
    fetchUser,
    logInUser: (ctx) => logInUser(ctx.login),
  },
};

/* ----------------------------------------------------------------
  * Machine
---------------------------------------------------------------- */
const authMachine = createMachine<AuthContext, AuthEvent, AuthTypedStates>(authMachineConfig, authMachineOptions);

/* ----------------------------------------------------------------
  * MachineService
---------------------------------------------------------------- */
export const authMachineService = interpret(authMachine, { devTools: true }).start();

/* ----------------------------------------------------------------
  * useMachine
  Create a custom service hook for this machine, that takes the service previously created.
  This way you don't have to import on every component the useService hook and the service created.
---------------------------------------------------------------- */
export const useAuthMachine = () => {
  return useActor(authMachineService);
};
