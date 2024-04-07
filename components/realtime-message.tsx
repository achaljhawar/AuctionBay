import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
type Message = {
  id: bigint;
  created_at: string;
  chatroom_id: string;
  sender_id: bigint;
  text: string;
};

export default function RealtimeMessages({
  messages,
}: {
  messages: Message[];
}) {
  useEffect(() => {
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
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

  return <pre>{JSON.stringify(messages, null, 2)}</pre>;
}
