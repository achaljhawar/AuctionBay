import React, { useState, useEffect } from 'react';
import RealtimeMessages from '@/components/realtime-messages';

interface User {
  id: string;
  // Add other properties of the user object here
}

interface ChatRoom {
  id: bigint;
  createdAt: Date;
  chatroomId: string;
  senderId: bigint; // Changed to bigint
  text: string;
  // Add other properties of the chat room object here
}

export default function Page() {
  const [data, setData] = useState<ChatRoom[] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = sessionStorage.getItem('token');
      try {
        const response = await fetch('/api/chat/findUserChats', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const { data: chatrooms } = await response.json();
          setData(chatrooms);
        } else {
          const { message } = await response.json();
          console.error('Error:', message);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchData();
  });

  if (!data) {
    return <div>Loading...</div>;
  }

  return <RealtimeMessages serverPosts={data ?? []} />;
}

type Message = {
  id: bigint;
  createdAt: Date;
  chatroomId: string;
  senderId: bigint; // Changed to bigint
  text: string;
}
