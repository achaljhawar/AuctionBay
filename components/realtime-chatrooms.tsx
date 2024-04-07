import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type chatroom = {
  created_at: Date;
  chatroom_id: bigint;
  user_id_1: bigint;
  user_id_2: bigint;

};

export default function RealtimeChatrooms({
  chatrooms,
}: {
  chatrooms: chatroom[];
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

  return <pre>{JSON.stringify(chatrooms, null, 2)}</pre>;
}