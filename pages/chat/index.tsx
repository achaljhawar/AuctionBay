import React, { useState, useEffect } from 'react';
import RealtimeChatrooms from '@/components/realtime-chatrooms';

interface User {
  id: string;
}

interface ChatRoom {
  created_at: Date;
  chatroom_id: bigint;
  user_id_1: bigint;
  user_id_2: bigint;

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

  return <RealtimeChatrooms chatrooms={data ?? []} />;
}

