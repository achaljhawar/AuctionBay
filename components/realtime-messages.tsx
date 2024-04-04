import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type Message = {
  id: bigint;
  createdAt: Date;
  chatroomId: string;
  senderId: bigint;
  text: string;
};

export default function RealtimeMessages({
  serverPosts,
}: {
  serverPosts: Message[];
}) {
  useEffect(() => {
    const channel = supabase
      .channel('chatrooms')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chatrooms',
        },
        (payload) => {
          console.log({ payload });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return <pre>{JSON.stringify(serverPosts, null, 2)}</pre>;
}