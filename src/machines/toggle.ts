import { useActor } from '@xstate/vue';
import type { MachineConfig, MachineOptions, StateNode } from 'xstate';
import { assign, createMachine, interpret } from 'xstate';

/* ----------------------------------------------------------------
  * Context
---------------------------------------------------------------- */
interface ToggleContext {
  count: number;
}

/* ----------------------------------------------------------------
  * States
---------------------------------------------------------------- */
interface ToggleStates {
  states: {
    inactive: StateNode;
    active: StateNode;
  };
}

type ToggleTypedStates = InactiveState | ActiveState;
interface InactiveState {
  value: 'inactive';
  context: ToggleContext;
}
interface ActiveState {
  value: 'active';
  context: ToggleContext;
}

/* ----------------------------------------------------------------
  * Event
---------------------------------------------------------------- */
type ToggleEvent = TOGGLE_EVENT;
interface TOGGLE_EVENT {
  type: 'TOGGLE';
}

/* ----------------------------------------------------------------
  * MachineConfig
---------------------------------------------------------------- */
export const toggleMachineConfig: MachineConfig<ToggleContext, ToggleStates, ToggleEvent> = {
  id: 'toggle',
  context: {
    count: 0,
  },
  initial: 'inactive',
  states: {
    inactive: {
      on: { TOGGLE: 'active' },
    },
    active: {
      entry: assign({ count: (ctx) => ctx.count + 1 }),
      on: { TOGGLE: 'inactive' },
    },
  },
};

/* ----------------------------------------------------------------
  * MachineOptions
---------------------------------------------------------------- */
const toggleMachineOptions: Partial<MachineOptions<ToggleContext, ToggleEvent>> = {
  actions: {},
  guards: {},
  services: {},
};

/* ----------------------------------------------------------------
  * Machine
---------------------------------------------------------------- */
const toggleMachine = createMachine<ToggleContext, ToggleEvent, ToggleTypedStates>(
  toggleMachineConfig,
  toggleMachineOptions
);

/* ----------------------------------------------------------------
  * MachineService
---------------------------------------------------------------- */
export const toggleMachineService = interpret(toggleMachine, { devTools: true }).start();

/* ----------------------------------------------------------------
  * useMachine
  Create a custom service hook for this machine, that takes the service previously created.
  This way you don't have to import on every component the useService hook and the service created.
---------------------------------------------------------------- */
export const useToggleMachine = () => {
  return useActor(toggleMachineService);
};
