export const supabaseUrl = "";
export const supabaseKey = "";

export const hasSupabase = false;

export const supabase = {
  from: () => ({
    select: () => ({
      order: async () => ({ data: [], error: null }),
    }),
    insert: () => ({
      select: () => ({
        single: async () => ({ data: null, error: null }),
      }),
    }),
    update: () => ({
      eq: () => ({
        select: () => ({
          single: async () => ({ data: null, error: null }),
        }),
      }),
    }),
    delete: () => ({
      eq: async () => ({ error: null }),
    }),
  }),
} as any;
