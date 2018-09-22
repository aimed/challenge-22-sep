import uuid from 'uuid';
import mongoose from 'mongoose';
import { getModels } from '../../src/models';

export function testKit() {
    const container = {
        mongoose: null,
        models: null
    };

    const setup = async () => {
        const testdb = 'mongodb://localhost/' + uuid();
        const connection = await mongoose.connect(testdb);
        container.mongoose = connection;
        container.models = getModels(connection);
    }

    const teardown = async () => {
        await container.mongoose.connection.dropDatabase();
        await container.mongoose.disconnect();
    }
    return { container: container, setup: setup, teardown: teardown };
}