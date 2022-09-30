import { createPubSub, PubSub } from '@graphql-yoga/node';
import { createServer } from 'graphql-yoga';


const TODOS_CHANNEL = "TODOS_CHANNEL"
export type PubSubChannels = {
    TODOS_CHANNEL: [{ todos: Record<string, any>[] }]
}
const pubsub = createPubSub<PubSubChannels>()

type GraphQLContext = {
    pubsub: typeof pubsub
}

let todos = [
    {
        id: "1",
        done: false,
        text: "Learn Graphql and Solid",
    }
]

const typeDefs = `
    type Todo {
        id: ID!
        done: Boolean!
        text: String!
    }
    type Query {
        getTodos: [Todo]!
    }
    type Mutation {
        addTodo(text: String!): Todo
        setDone(id: ID!, done: Boolean!): Todo
    }
    type Subscription {
        todos: [Todo]!
    }
`

const resolvers = {
    Query: {
        getTodos: () => {
            return todos
        }
    },
    Mutation: {
        addTodo: (
            _: unknown,
            { text }: { text: string },
            { pubsub }: { pubsub: PubSub<PubSubChannels> }
        ) => {
            const newTodo = {
                id: String(todos.length + 1),
                done: false,
                text
            }
            todos.push(newTodo)
            pubsub.publish(TODOS_CHANNEL, { todos })
            return newTodo
        },
        setDone: (
            _: unknown,
            { id, done }: { id: string, done: boolean },
            { pubsub }: { pubsub: PubSub<PubSubChannels> }
        ) => {
            const todo = todos.find(todo => {
                return todo.id === id
            })
            if (!todo) throw new Error("Todo not found");

            todo.done = done
            pubsub.publish(TODOS_CHANNEL, { todos })
            return todo
        }
    },
    Subscription: {
        todos: {
            subscribe: (_: unknown, args: {}, context: GraphQLContext) => context.pubsub.subscribe(TODOS_CHANNEL)
        }
    }
}

const server = createServer({
    cors: {
        origin: 'http://localhost:3000',
        credentials: false,
        methods: ['POST']
    },
    context: { pubsub },
    schema: {
        resolvers,
        typeDefs,
    }
})

server.start()
