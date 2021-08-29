import * as yup from 'yup';
import { Express, Request, Response } from 'express';
import { Settings } from '../components/Settings';

const schema = yup
    .object({
        pointer: yup.number().integer().positive().required(),
    })
    .required();

export default (app: Express) => {
    /**
    * @swagger
    *
    * /default:
    *   get:
    *     summary: "Get default route"
    *     produces:
    *       - "application/json"
    *     responses:
    *       "200":
    *         description: "Returns welcome message."
    *         content:
    *           application/json
    */
    app.get('/settings/:id', async (req: Request, res: Response) => {
        const validData = await schema.validate(req.params)

        const data = await Settings.list(validData.pointer);

        res.status(200).json({
            message: 'Successful route response...',
            data
        });
    });
};
