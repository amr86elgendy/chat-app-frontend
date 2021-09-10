import React, { useState } from 'react';
import classNames from 'classnames';
import moment from 'moment';

import { Button } from 'react-bootstrap';

import { useAuthState } from '../../context/auth';
import { gql, useMutation } from '@apollo/client';

const reactions = ['❤️', '😆', '😯', '😢', '😡', '👍', '👎'];

const REACT_TO_MESSAGE = gql`
  mutation reactToMessage($id: ID!, $content: String!) {
    reactToMessage(id: $id, content: $content) {
      id
    }
  }
`;

export default function Message({ message }) {
  const [showReactions, setShowReactions] = useState(false);
  const { user } = useAuthState();
  const sent = message.from === user.username;
  const received = !sent;

  const reactionIcons = message.reactions && [...new Set(message.reactions.map((r) => r.content))];

  const [reactToMessage] = useMutation(REACT_TO_MESSAGE, {
    onError: (err) => console.log(err),
    onCompleted: (data) => setShowReactions(false),
  });

  const react = (reaction) => {
    reactToMessage({ variables: { id: message.id, content: reaction } });
    setShowReactions(false)
  };

  const reactButtons = (
    <div
      className={classNames('react-buttons my-3', {
        'd-none': !showReactions,
        'right': sent,
      })}
    >
      {reactions.map((reaction) => (
        <Button
          variant='link'
          className='react-icon-button'
          key={reaction}
          onClick={() => react(reaction)}
        >
          {reaction}
        </Button>
      ))}
    </div>
  );

  return (
    <div
      className={classNames('position-relative d-flex flex-column my-3', {
        'ms-auto': sent,
        'me-auto': received,
      })}
    >
      {reactButtons}
      <div className='d-flex'>
        {sent && (
          <Button
            variant='link'
            className='px-2'
            onClick={() => setShowReactions(!showReactions)}
          >
            <i className='far fa-smile'></i>
          </Button>
        )}
        <div
          className={classNames('position-relative py-2 px-3 rounded-pill', {
            'bg-primary': sent,
            'bg-secondary': received,
          })}
        >
          {message.reactions.length > 0 && (
            <div className="p-1 reactions-div bg-secondary rounded-pill">
              {reactionIcons} {message.reactions.length}
            </div>
          )}
          <p className={classNames({ 'text-white text-center': sent })}>
            {message.body}
          </p>
        </div>
        {received && (
          <Button
            variant='link'
            className='px-2'
            onClick={() => setShowReactions(!showReactions)}
          >
            <i className='far fa-smile'></i>
          </Button>
        )}
      </div>
      <small style={{ fontSize: '.75rem', color: 'gray', textAlign: 'center' }}>
        {moment(message.createdAt).format('MM / DD, h:mm a')}
        {/* dddd, MMMM Do YYYY, h:mm:ss a */}
      </small>
    </div>
  );
}
