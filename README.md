# Typescript boilerplate
A boilerplate of a monorepo setup for typescript based services, with commonly used implementation held within the common service.

## Installation
To install dependencies run the following command at the root directory level:

```bash
yarn
```

## Usage
Run all services in a locally
```bash
yarn run start:dev
```

Run a specific service locally
```bash
yarn workspace @example/example start:dev
```

## TODO's
[x] Add Cassandra database connect logic into the common package
[x] Add MSSQL database connect logic into the common package
[x] Add Redis Cluster database connect logic into the common package
[x] Add a generic HTTP/S communication layer between services in the common package
[ ] Add NodeJS best practice kill process handling
[ ] Add GraphQL to the API service
[ ] Generate swagger docs for the API service
[ ] Add definitive NODE_ENV values that are validated on service start (dev,test,prod)
[ ] Add Postgres database connect logic into the common package
[ ] Add MySql database connect logic into the common package
[ ] Add DynamoDB database connect logic into the common package
[ ] Add MongoDB database connect logic into the common package
[ ] Add Elasticsearch database connect logic into the common package
[ ] Add Neo4j database connect logic into the common package
[ ] Add GRPC as a communication layer between services
[ ] Add websockets (socket.io) as a communication layer between services
[ ] Add websockets (socket.io) into the API service
[ ] Add rate limiting logic into the API service
[ ] Add caching logic into the API service
[ ] Add caching logic into the communication layer between services
[ ] Add best practice container builds
[ ] Add best practice GitHub action pipeline steps
[ ] Add GitHub action remote runners (to save on costs)
[ ] Add generic pubsub communication method between services
[ ] Add generic message queue communiction method between services

## Code patterns
Being a monorepo, each of the services are found within the `packages` directory.

Each service follows the same pattern:

#### `index.ts`
Service initiation logic

#### `/components`
Directory containing the core component files of the service. See the "components" section for more details.

#### `/routes`
Directory containing the HTTP/S routes exposed by the service.

#### `/utils`
Directory containing any miscellaneous logic specific to the service, generic logic should be placed within the "common" package. See the "common package" section for more details.   

### Components
Components is a development pattern focused on the separation of concern and reusability of code. In a nutshell each "component" has a single responsibility for an area of the application, it is interacted with via interfaces provided. It's closely linked with the OO pattern in regards to reusability. 

e.g. A "user" component manages everything to do with a user. Creating, updating, reading etc. Although users may be used extensively throughout the code base, they are only interacted with through this single "component". This often leads to having database logic baked into the component (this can be flexible in certain use cases as long as the single responsibility principal is maintained).

Wikipedia page on the pattern [here](https://en.wikipedia.org/wiki/Component-based_software_engineering) (take it with a pinch of salt, as it's still a Wikipedia page ;) )

### Common package
One of the excellent advantages of a monorepo is being able to share logic & types between services very easily in a local environment. The approach this repo has currently is utilising the "common" package as the place for all shared functionality. This can be adjusted in the future to further break out aspects to reduce dependency size (e.g. if only 2 of the services are using a piece of logic in the common package, yet it's still installed into every one of them).

The common package has the following directories currently (more can be added if) :

#### `/components`
The same principle as the components at the service level, except these can be used by separately deployed services.

#### `/databases`
Database instantiation classes allowing a service to connect to a certain type of database with built-in pooling (where possible) and logging logic.

#### `/errors`
Generic error constructs to be used throughout the application

#### `/sdks`
A directory housing the interfaces for each of the separately deployed services. Allowing strongly types HTTP/S calls across distributed services.

#### `/store`
Static data store for shared reseller consumption.

#### `/types`
Shared types.

#### `/utils`
Shared miscellaneous functionality.
