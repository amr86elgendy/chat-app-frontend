import React, { Fragment, useEffect, useState } from 'react';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { Col, Form } from 'react-bootstrap';

import { useMessageDispatch, useMessageState } from '../../context/message';

import Message from './Message';

const GET_MESSAGES = gql`
  query getMessages($from: String!) {
    getMessages(from: $from) {
      id
      from
      to
      body
      createdAt
      reactions {
        id
        content
      }
    }
  }
`;

const SEND_MESSAGE = gql`
  mutation sendMessage($to: String!, $body: String!) {
    sendMessage(to: $to, body: $body) {
      from
      to
      body
      createdAt
    }
  }
`;

export default function Messages() {
  const [body, setBody] = useState('');

  const { users } = useMessageState();
  const dispatch = useMessageDispatch();

  const selectedUser = users?.find((u) => u.selected === true);
  const messages = selectedUser?.messages;

  const [getMessages, { loading: messagesLoading, data: messagesData }] =
    useLazyQuery(GET_MESSAGES);

  const [sendMessage] = useMutation(
    SEND_MESSAGE,
    {
      refetchQueries: [
        GET_MESSAGES, // DocumentNode object parsed with gql
        'getMessages', // Query name
      ],
    },
    {
      onError: (err) => console.log(err),
    }
  );

  useEffect(() => {
    if (selectedUser && !selectedUser.messages) {
      getMessages({ variables: { from: selectedUser.username } });
    }
    // eslint-disable-next-line
  }, [selectedUser]);

  useEffect(() => {
    if (messagesData) {
      dispatch({
        type: 'SET_USER_MESSAGES',
        payload: {
          username: selectedUser.username,
          messages: messagesData.getMessages,
        },
      });
    }
    // eslint-disable-next-line
  }, [messagesData]);

  const submitMessage = (e) => {
    e.preventDefault();
    if (body.trim() === '' || !selectedUser) return;
    setBody('');
    // mutation for sending the message
    sendMessage({ variables: { to: selectedUser.username, body } });
  };

  let selectedChatMarkup;
  if (!messages && !messagesLoading) {
    selectedChatMarkup = <p className="info-text">Select a friend</p>;
  } else if (messagesLoading) {
    selectedChatMarkup = <p className="info-text">Loading..</p>;
  } else if (messages.length > 0) {
    selectedChatMarkup = messages.map((message, index) => (
      <Fragment key={index}>
        <Message message={message} />
        {index === messages.length - 1 && (
          <div className='invisible'>
            <hr className='m-0' />
          </div>
        )}
      </Fragment>
    ));
  } else if (messages.length === 0) {
    selectedChatMarkup = <p className="info-text">You are now connected! send your first message!</p>;
  }

  return (
    <Col xs={10} md={8} className='px-4'>
      <div className='messages-box d-flex flex-column-reverse'>
        {selectedChatMarkup}
      </div>
      <div>
        <Form onSubmit={submitMessage}>
          <Form.Group className='mb-3 d-flex align-items-center'>
            <Form.Control
              type='text'
              className='p-3 border-0 message-input rounded-pill bg-secondary'
              placeholder='Type a message..'
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
            <i
              className='ms-2 fas fa-paper-plane fa-2x text-primary'
              onClick={submitMessage}
              role='button'
            ></i>
          </Form.Group>
        </Form>
      </div>
    </Col>
  );
}
