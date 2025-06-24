import { readFileSync } from 'fs';
import { join } from 'path';
import { makeExecutableSchema } from '@graphql-tools/schema';
import clientResolvers from './resolver.js';

const clientTypeDefs = readFileSync(join(process.cwd(), "schema.graphql"), 'utf8')

const schema = makeExecutableSchema({
  typeDefs: [clientTypeDefs],
  resolvers: [clientResolvers],
});

export default schema;
