import { createClient, defaultExchanges, subscriptionExchange } from '@urql/core';
import { Component, createSignal, For } from 'solid-js';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { pipe, subscribe } from 'wonka';

export interface Todo {
  id: string;
  done: boolean;
  text: string;
}
const subscriptionClient = new SubscriptionClient(
  "ws://0.0.0.0:4000/graphql",
  {
    reconnect: true
  }
)

const client = createClient({
  url: "http://0.0.0.0:4000/graphql",
  exchanges: [
    ...defaultExchanges,
    subscriptionExchange({
      forwardSubscription: (operation) => subscriptionClient.request(operation)
    }),
  ]
})

const [todos, setTodos] = createSignal<Todo[]>([])

const { unsubscribe } = pipe(
  client.subscription(`
  subscription {
    todos {
      id
      done
      text
    }
  }
  `,
  {}),
  subscribe((result) => { setTodos(result.data.todos) })
)

const App: Component = () => {
  const [text, setText] = createSignal('')
  const onAdd = async () => {
    await client.mutation(`
      mutation($text: String!) {
        addTodo(text: $text){
          id
        }
      }
    `, {
      text: text()
    })
      .toPromise()
    setText("")
  }

  const onToggle = async (id: string, done: boolean) => {
    client.mutation(`
      mutation($id: ID!, $done: Boolean!){
        setDone(id: $id, done: $done){
          id
          text
        }
      }
    `, {
      id,
      done
    })
      .toPromise()
  }

  return (
    <div>
      Todo:
      <For
        each={todos()}>
        {({ id, done, text }) => <div>
          <input type="checkbox" checked={done} onclick={() => onToggle(id, !done)} />
          <span>{text}</span>
        </div>}
      </For>
      <div>
        <input oninput={evt => setText(evt.currentTarget.value)} type="text" value={text()} />
        <button onclick={onAdd}>Add</button>
      </div>
    </div>
  );
};

export default App;
