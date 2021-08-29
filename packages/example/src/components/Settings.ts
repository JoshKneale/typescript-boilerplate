import { ExampleSetting } from '@example/common'
import { cassandra } from '../utils/databases';

export class Settings {
    public static async get(id: number): Promise<ExampleSetting> {
        const row = await cassandra.runQuery<ExampleSetting>('SELECT * FROM mytable WHERE id = ?', [id])

        if (!row) {
            throw new Error(`Cannot find setting with ID: ${id}`)
        }

        return row;
    }

    public static async list(_pointer?: number): Promise<ExampleSetting[]> {
        const rows = await cassandra.runQuery<ExampleSetting[]>('SELECT * FROM mytable', [])

        return rows || [];
    }
}
