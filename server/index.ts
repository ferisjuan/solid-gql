import { createServer } from 'graphql-yoga';

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
`

const resolvers = {
    Query: {
        getTodos: () => {
            return todos
        }
    },
    Mutation: {
        addTodo: (_: unknown, { text }: { text: string }) => {
            const newTodo = {
                id: String(todos.length + 1),
                done: false,
                text
            }
            todos.push(newTodo)

            return newTodo
        },
        setDone: (_: unknown, { id, done }: { id: string, done: boolean }) => {
            console.log('🚀🚀🚀 ~ file: index.ts ~ line 44 ~ done', done)
            const todo = todos.find(todo => {
                return todo.id === id
            })
            console.log('🚀🚀🚀 ~ file: index.ts ~ line 45 ~ todo', todo)
            if (!todo) throw new Error("Todo not found");

            todo.done = done
            return todo
        }
    }
}
const server = createServer({
    cors: {
        origin: 'http://localhost:3000',
        credentials: false,
        methods: ['POST']
    },
    schema: {
        typeDefs,
        resolvers
    }
})

server.start()
