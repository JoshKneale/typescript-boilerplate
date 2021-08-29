import { Express, Request, Response } from 'express';
// import * as yup from 'yup';
import { settingsSDK } from '../utils/sdks';

// const schema = yup
//     .object({
//         privateLabelId: yup.number().integer().positive().required(),
//     })
//     .required();

export default (app: Express) => {
    /**
    * @swagger
    *
    * /default:
    *   get:
    *     summary: "Get default route"
    *     produces:
    *       - "application/json"
    *     responses:s
    *       "200":
    *         description: "Returns welcome message."
    *         content:
    *           application/json
    */
    app.get('/settings', async (_req: Request, res: Response) => {
        // const validData = await schema.validate(req.params)

        const data = await settingsSDK.list()

        res.status(200).json(data);
    });
};
