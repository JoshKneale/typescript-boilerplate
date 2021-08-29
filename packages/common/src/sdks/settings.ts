import { validate } from "../utils/validateEnv";
import axios, { AxiosInstance } from 'axios';
import { ControlledError, ControlledResponse } from "../errors/controlled";
import * as queryString from 'querystring';
import { ExampleSetting } from "../types/settings";

export class SettingsSDK {
    private readonly EXAMPLE_SERVICE_URL: string
    private readonly client: AxiosInstance;
    constructor() {
        // Validate URL exists in process.env
        this.EXAMPLE_SERVICE_URL = validate('EXAMPLE_SERVICE_URL');

        // Create base axios client
        this.client = axios.create({
            baseURL: this.EXAMPLE_SERVICE_URL,
        })
    }

    /**
     * Get entitiy
     */
    public async get(id: number): Promise<ExampleSetting> {
        return this.request<ExampleSetting>(`/examplesettings?${queryString.stringify({ id })}`, 'GET',)
    }

    /**
     * List entities, uses a pointer for pagination.
     */
    public async list(pointer?: number): Promise<ExampleSetting[]> {
        return this.request<ExampleSetting[]>(`/examplesettings?${queryString.stringify({ pointer })}`, 'GET',)
    }

    /**
     * Set entity
     */
    public async set(body: Partial<ExampleSetting>): Promise<ExampleSetting> {
        return this.request<ExampleSetting>(`/examplesettings`, 'POST', body)
    }

    private async request<T>(path: string, method: 'GET' | 'POST' | 'PATCH' | 'DELETE', body?: any): Promise<T> {
        try {
            const { data } = await this.client.request({
                url: path,
                method,
                data: body,
            })
            return data;
        } catch (e) {
            const { response } = e;
            if (!response) {
                throw new Error('Response from example service was missing the body')
            }
            const { data } = response as ControlledResponse;
            if (data && data.error && data.error.type === 'ControlledError') {
                throw new ControlledError(data.error.message)
            } else {
                throw new Error('Something went wrong with the request to the example service')
            }
        }
    }
}
