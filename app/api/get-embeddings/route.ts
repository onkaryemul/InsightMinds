import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Simple select all from process_messages
    const { data, error } = await supabase
      .from('processed_messages')
      .select('*');

    if (error) {
      console.log(error);
    
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log(data);

    return NextResponse.json(data);
  } 
  catch (error) {
    console.error('Error in get-embeddings route :', error);

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 