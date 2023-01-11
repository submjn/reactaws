import React, { useState, useEffect } from 'react';
import './App.css';
import "@aws-amplify/ui-react/styles.css";
import { API, graphqlOperation } from "aws-amplify";
import {
  withAuthenticator,
  Button,
  Flex,
  Text,
  TextField,
  Heading,
  View,
} from "@aws-amplify/ui-react";
import { listTodos } from './graphql/queries';
import {
  createTodo as createTodoMutation,
  deleteTodo as deleteTodoMutation,
} from "./graphql/mutations";

function App({ signOut }: any) {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    fetchTodos();
  }, [])

  async function fetchTodos() {
    const todoData: any = await API.graphql(graphqlOperation(listTodos));
    
    const todosFromAPI = todoData.data.listTodos.items;
    console.log(todosFromAPI)
    setTodos(todosFromAPI);
  }

  async function createTodo(event: any) {
    event.preventDefault();
    const form = new FormData(event.target);
    const data = {
      name: form.get("name"),
      description: form.get("description"),
    };
    await API.graphql({
      query: createTodoMutation,
      variables: {input: data},
    });
    fetchTodos();
    event.target.reset();
  }

  async function deleteTodo({id}: any) {
    const newNotes = todos.filter((note: any) => note.id !== id);
    setTodos(newNotes);
    await API.graphql({
      query: deleteTodoMutation,
      variables: { input: { id } },
    });
  }

  return (
    <View className="App">
      <Heading level={1}>My Notes App</Heading>
      <View as="form" margin="3rem 0" onSubmit={createTodo}>
        <Flex direction="row" justifyContent="center">
          <TextField 
            name="name"
            placeholder="Note Name"
            label="Note Name"
            labelHidden
            variation="quiet"
            required
          />
          <TextField
            name="description"
            placeholder="Note Description"
            label="Note Description"
            labelHidden
            variation="quiet"
            required
          />
          <Button type="submit" variation="primary">
            Create Note
          </Button>
        </Flex>
      </View> 
      <Heading level={2}>Current Notes</Heading>
      <View margin="3rem 0">
        {todos.map((note: any) => (
          <Flex
            key={note.id || note.name}
            direction="row"
            justifyContent="center"
            alignItems="center"
          >
            <Text as="strong" fontWeight={700}>
              {note.name}
            </Text>
            <Text as="span">{note.description}</Text>
            <Button variation="link" onClick={() => deleteTodo(note)}>
              Delete note
            </Button>
          </Flex>
        ))}
      </View>
      <Button onClick={signOut}>Sign Out</Button>
    </View>
  );
}

export default withAuthenticator(App);

