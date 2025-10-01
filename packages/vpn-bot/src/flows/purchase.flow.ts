// Импортируем (пока не созданные) компоненты и бизнес-логику
import { SelectPlanComponent } from "../components/SelectPlan.component";
import { PaymentComponent } from "../components/Payment.component";
import { ReceiveFileComponent } from "../components/ReceiveFile.component";

import {
	getPlansQuery,
	getOrderQuery,
	getOvpnFileQuery,
} from "../domain/queries";
import { createOrderCommand, processPaymentCommand } from "../domain/commands";
import { createFlow } from "@bot-machine/telegram-sdk/src/flow";

export const purchaseFlow = createFlow("purchaseFlow", {
	config: {
		// --- Состояние 1: Выбор тарифного плана ---
		selectPlan: {
			component: SelectPlanComponent,
			// При входе в это состояние, получаем список планов
			onEnter: getPlansQuery,
			onAction: {
				// Когда пользователь нажимает на кнопку с планом (e.g., callback_data: 'select_plan:1')
				"select_plan:(.+)": {
					// Выполняем команду создания заказа
					command: createOrderCommand,
					// Переходим в состояние оплаты
					nextState: "payment",
				},
			},
		},

		// --- Состояние 2: Оплата ---
		payment: {
			component: PaymentComponent,
			// При входе, получаем детали созданного заказа
			onEnter: getOrderQuery,
			onAction: {
				// Когда пользователь нажимает "Оплатить"
				pay: {
					command: processPaymentCommand,
					// Переходим в состояние получения файла
					nextState: "receiveFile",
				},
			},
		},

		// --- Состояние 3: Получение файла ---
		receiveFile: {
			component: ReceiveFileComponent,
			// При входе, получаем контент .ovpn файла
			onEnter: getOvpnFileQuery,
			// Это финальное состояние, действий нет
			onAction: {},
		},
	},
});
