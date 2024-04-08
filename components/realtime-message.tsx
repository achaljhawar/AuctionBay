import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type Message = {
  id: bigint;
  created_at: string;
  chatroom_id: string;
  sender_id: bigint;
  text: string;
};

export default function RealtimeMessages({ messages, chatroom_id }: { messages: Message[], chatroom_id: string }) {
  const [newMessage, setNewMessage] = useState('');
  const [allMessages, setAllMessages] = useState<Message[]>(messages);

  useEffect(() => {
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          // Update the state with the new message
          setAllMessages((prevMessages) => [...prevMessages, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('newMessage:', chatroom_id);
    if (newMessage.trim() !== '') {
      const token = sessionStorage.getItem('token');
      const response = await fetch('/api/chat/createMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ chatroom_id, message: newMessage }),
      });
      console.log('response:', response);
      setNewMessage('');
    }
  };

  return (
    <div>
      {allMessages.map((message) => (
        <div key={message.id.toString()}>
          <p>
            <strong>Sender ID:</strong> {message.sender_id.toString()}
          </p>
          <p>
            <strong>Created at:</strong> {message.created_at}
          </p>
          <p>{message.text}</p>
        </div>
      ))}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter your message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}