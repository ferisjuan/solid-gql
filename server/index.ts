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
`

const resolvers = {
    Query: {
        getTodos: () => {
            return todos
        }
    }
}
const server = createServer({
    schema: {
        typeDefs,
        resolvers
    }
})

server.start()
