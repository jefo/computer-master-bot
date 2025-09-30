
import { createFlow } from '../flow';
import { CounterComponent } from './Counter.component';
import { RenameComponent } from './Rename.component';
import { getCounterQuery, incrementCounterCommand, decrementCounterCommand, renameCounterCommand } from '../core/counter';

export const mainFlow = createFlow({
  'counter': {
    component: CounterComponent,
    onEnter: getCounterQuery,
    onAction: {
      'increment': {
        command: incrementCounterCommand,
        refresh: true,
      },
      'decrement': {
        command: decrementCounterCommand,
        refresh: true,
      },
      'rename': {
        command: async () => {},
        nextState: 'rename',
      },
    },
  },
  'rename': {
    component: RenameComponent,
    onEnter: getCounterQuery, // Also get current data for the view
    onAction: {
      // Go back to the previous screen
      'back': {
        command: async () => {},
        nextState: 'counter',
      },
    },
    onText: {
      // Handle the new name
      ':newName': {
        command: async (payload, ctx) => renameCounterCommand({ newName: ctx.params.newName }, ctx),
        nextState: 'counter',
      },
    },
  },
});
