import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
interface Message {
  id: bigint;
  created_at: string;
  chatroom_id: string;
  sender_id: bigint;
  text: string;
}
import RealtimeMessages from '@/components/realtime-message';

export default function Page() {
  const router = useRouter();
  const chatroom_id = router.query.slug;
  const [data, setData] = useState<Message[]| null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = sessionStorage.getItem('token');
      try {
        const response = await fetch('/api/chat/getMessages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ chatroom_id }),
        });
        if (response.ok) {
          const { data: messages } = await response.json();
          setData(messages);
        } else {
          const { message } = await response.json();
          console.error('Error:', message);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    if (chatroom_id) fetchData();
  }, [chatroom_id, data]);

  if (!data) {
    return <div>Loading...</div>;
  }

  return <RealtimeMessages messages={data ?? []} />
}