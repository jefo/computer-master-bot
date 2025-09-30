
import { createFlow } from '../flow';
import { CounterComponent } from './Counter.component';
import { getCounterQuery, incrementCounterCommand, decrementCounterCommand } from '../core/counter';

export const mainFlow = createFlow({
  'counter': {
    component: CounterComponent,
    onEnter: getCounterQuery, // Get the counter when entering the state
    onAction: {
      'increment': {
        command: incrementCounterCommand,
        refresh: true, // Re-render the current screen using the DTO from the command
      },
      'decrement': {
        command: decrementCounterCommand,
        refresh: true,
      },
    },
  },
});
