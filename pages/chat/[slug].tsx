import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
interface Message {
  id: bigint;
  created_at: string;
  chatroom_id: string;
  sender_id: bigint;
  text: string;
}
import withAuth from '@/components/withAuth';
import RealtimeMessages from '@/components/realtime-message';
interface chatprops {}
const Page: React.FC<chatprops> = () => {
  const router = useRouter();
  const chatroom_id = router.query.slug;
  const [data, setData] = useState<Message[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = sessionStorage.getItem('token');

      try {
        // First, check if the chatroom exists
        const findChatResponse = await fetch('/api/chat/findChat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ chatroom_id }),
        });

        if (findChatResponse.ok) {
          // If the chatroom exists, fetch the messages
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
            setError(`Error: ${message}`);
          }
        } else {
          const { message } = await findChatResponse.json();
          setError(`Error: ${message}`);
        }
      } catch (error) {
        setError('An unknown error occurred');
        console.error('Error:', error);
      }
    };

    if (chatroom_id) fetchData();
  }, [chatroom_id]);

  if (error) {
    return <div>{error}</div>;
  }

  if (!data) {
    return <div>Loading...</div>;
  }

  return <RealtimeMessages messages={data ?? []} chatroom_id={chatroom_id ? chatroom_id.toString() : ""} />;
}

export default withAuth(Page);