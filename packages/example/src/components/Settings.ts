import { ExampleSetting } from '@example/common'

export class Settings {
    public static async get(id: number): Promise<ExampleSetting> {
        const row = {
            id: 1,
            name: 'active',
            state: true
        }

        if (!row) {
            throw new Error(`Cannot find setting with ID: ${id}`)
        }

        return row;
    }

    public static async list(_pointer?: number): Promise<ExampleSetting[]> {
        const rows = [
            {
                id: 1,
                name: 'active',
                state: true
            },
            {
                id: 2,
                name: 'active',
                state: true
            }
        ]

        return rows || [];
    }
}
