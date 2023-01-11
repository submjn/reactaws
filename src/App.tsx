import React, { useState, useEffect } from 'react';
import './App.css';
import "@aws-amplify/ui-react/styles.css";
import { API, Storage } from "aws-amplify";
import {
  Button,
  FileUploader,
  Flex,
  Heading,
  Image,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextAreaField,
  TextField,
  Theme,
  ThemeProvider,
  View,
  withAuthenticator,
} from "@aws-amplify/ui-react";
import { listMembers } from './graphql/queries';
import {
  createMember as createTodoMutation,
  deleteMember as deleteTodoMutation,
} from "./graphql/mutations";

function App({ signOut }: any) {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    fetchMembers();
  }, [])

  async function fetchMembers() {
    const apiData: any = await API.graphql({query: listMembers});
    
    const dataFromAPI = apiData.data.listMembers.items;
    await Promise.all(
      dataFromAPI.map(async (member: any) => {
        if(member.image) {
          const url = await Storage.get(member.name);
          member.image = url;
        }
        return member;
      })
    )
    setMembers(dataFromAPI);
  }

  async function createMember(event: any) {
    event.preventDefault();
    const form = new FormData(event.target);
    const image: any = form.get("image");
    const data = {
      firstName: form.get("fname"),
      lastName: form.get("lname"),
      age: form.get("age"),
      gender: form.get("gender"),
      family: form.get("fmembers"),
      image: image.name
    } as any;
    if(!!data.image) await Storage.put(data.name, image);
    await API.graphql({
      query: createTodoMutation,
      variables: {input: data},
    });
    fetchMembers();
    event.target.reset();
  }

  async function deleteMember({id, name}: any) {
    const newNotes = members.filter((member: any) => member.id !== id);
    setMembers(newNotes);
    await Storage.remove(name);
    await API.graphql({
      query: deleteTodoMutation,
      variables: { input: { id } },
    });
  }

  const theme: Theme = {
    name: 'table-theme',
    tokens: {
      components: {
        table: {
          row: {
            hover: {
              backgroundColor: { value: '{colors.blue.20}' },
            },
  
            striped: {
              backgroundColor: { value: '{colors.blue.10}' },
            },
          },
  
          header: {
            color: { value: '{colors.blue.80}' },
            fontSize: { value: '{fontSizes.xl}' },
          },
  
          data: {
            fontWeight: { value: '{fontWeights.semibold}' },
          },
        },
      },
    },
  };

  return (
    <View className="App">
      <Heading level={1}>Hudeo House</Heading>
      <View as="form" margin="3rem" onSubmit={createMember}>
        <View margin="3rem 0">
          <Flex direction="row" justifyContent="left">
            <TextField 
              name="fname"
              placeholder="First Name"
              label="First Name"
              required
            />
            <TextField 
              name="lname"
              placeholder="Last Name"
              label="Last Name"
              required
            />
          </Flex>
        </View>
        <View margin="3rem 0">
        <Flex direction="row" justifyContent="left">
          <TextField 
            name="age"
            placeholder="First Name"
            label="Age"
            required
          />
          <TextField 
            name="gender"
            placeholder="Last Name"
            label="Gender"
          />
          <TextField 
            name="fmembers"
            placeholder="Family Members"
            label="Family Members"
          />
        </Flex>
        </View>
        <View margin="3rem 0">
        <Flex direction="column" justifyContent="center">
          <TextAreaField
            label="Member Description"
            placeholder="Write something about you!"
          />
          <View
            name="image"
            as="input"
            type="file"/>
          <Button type="submit" variation="primary">
            Create Member
          </Button>
        </Flex>
        </View>
      </View> 
      <Heading level={2}>All Members</Heading>
      <View margin="3rem 0">
        <ThemeProvider theme={theme} colorMode="light">
          <Table highlightOnHover variation="striped">
            <TableHead>
              <TableRow>
                <TableCell as="th">Name</TableCell>
                <TableCell as="th">Age</TableCell>
                <TableCell as="th">Gender</TableCell>
                <TableCell as="th">Family</TableCell>
                <TableCell as="th">About</TableCell>
                <TableCell as="th">Picture</TableCell>
                <TableCell as="th">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {members.map((member: any) => (
                <TableRow key={member.id || member.firstName}>
                  <TableCell>
                    {member.firstName + " " + member.lastName}
                  </TableCell>
                  <TableCell>
                    {member.age}
                  </TableCell>
                  <TableCell>
                    {member.gender}
                  </TableCell>
                  <TableCell>
                    {member.family}
                  </TableCell>
                  <TableCell>{member.description}</TableCell>
                  <TableCell>
                    {member.image && (
                      <Image
                        src={member.image}
                        alt={`visual aid for ${member.name}`}
                        style={{ width: 400 }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variation="link" onClick={() => deleteMember(member)}>
                      Delete member
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ThemeProvider>
      </View>
      <Button onClick={signOut}>Sign Out</Button>
    </View>
  );
}

export default withAuthenticator(App);

