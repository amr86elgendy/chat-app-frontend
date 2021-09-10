import React, { Fragment, useEffect } from 'react';
import { Container, Row } from 'react-bootstrap';
import { gql, useSubscription } from '@apollo/client';
import { useMessageDispatch } from '../../context/message';
import { useAuthState } from '../../context/auth';

import Users from './Users';
import Messages from './Messages';
import NavbarPage from './Navbar';

const NEW_MESSAGE = gql`
  subscription newMessage {
    newMessage {
      from
      to
      body
      createdAt
    }
  }
`;

const NEW_REACTION = gql`
  subscription newReaction {
    newReaction {
      id
      content
      message {
        id
        from
        to
      }
    }
  }
`;

export default function Home({ history }) {
  
  const messageDispatch = useMessageDispatch();

  const { user } = useAuthState();

  const { data: messageData, error: messageError } =
    useSubscription(NEW_MESSAGE);

  const { data: reactionData, error: reactionError } =
    useSubscription(NEW_REACTION);

  useEffect(() => {
    if (messageError) console.log(messageError);

    if (messageData) {
      const message = messageData.newMessage;
      const otherUser =
        user.username === message.to ? message.from : message.to;

      messageDispatch({
        type: 'ADD_MESSAGE',
        payload: {
          username: otherUser,
          message,
        },
      });
    }
    // eslint-disable-next-line
  }, [messageError, messageData]);

  useEffect(() => {
    if (reactionError) console.log(reactionError);

    if (reactionData) {
      const reaction = reactionData.newReaction;
      const otherUser =
        user.username === reaction.message.to
          ? reaction.message.from
          : reaction.message.to;

      messageDispatch({
        type: 'ADD_REACTION',
        payload: {
          username: otherUser,
          reaction,
        },
      });
    }
    // eslint-disable-next-line
  }, [reactionError, reactionData]);

  

  return (
    <Fragment>
      <NavbarPage />
      <div className='d-flex'>
        <Users />
        <Messages />
      </div>
    </Fragment>
  );
}
