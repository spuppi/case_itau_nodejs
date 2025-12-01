import { Router } from 'express';
import { ClientesController } from './clientes.controller';

const router = Router();
const controller = new ClientesController();

router.get('/clientes', controller.listar.bind(controller));
router.get('/clientes/:id', controller.buscarPorId.bind(controller));
router.post('/clientes', controller.criar.bind(controller));
router.put('/clientes/:id', controller.atualizar.bind(controller));
router.delete('/clientes/:id', controller.excluir.bind(controller));
router.post('/clientes/:id/depositar', controller.depositar.bind(controller));
router.post('/clientes/:id/sacar', controller.sacar.bind(controller));

export { router as clientesRoutes };
