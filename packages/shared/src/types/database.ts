export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: { extensions?: Json; operationName?: string; query?: string; variables?: Json };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      display_links: {
        Row: {
          created_at: string;
          created_by: string | null;
          id: string;
          last_seen_at: string | null;
          name: string;
          org_id: string;
          token: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          last_seen_at?: string | null;
          name?: string;
          org_id: string;
          token?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          last_seen_at?: string | null;
          name?: string;
          org_id?: string;
          token?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'display_links_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'display_links_org_id_fkey';
            columns: ['org_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      entries: {
        Row: {
          achieved_at: string;
          attempts: number | null;
          created_at: string;
          id: string;
          leaderboard_id: string;
          note: string | null;
          org_id: string;
          player_id: string | null;
          recorded_by: string | null;
          team_id: string | null;
          value: number;
        };
        ComputedFields: never;
        Insert: {
          achieved_at?: string;
          attempts?: number | null;
          created_at?: string;
          id?: string;
          leaderboard_id: string;
          note?: string | null;
          org_id: string;
          player_id?: string | null;
          recorded_by?: string | null;
          team_id?: string | null;
          value: number;
        };
        Update: {
          achieved_at?: string;
          attempts?: number | null;
          created_at?: string;
          id?: string;
          leaderboard_id?: string;
          note?: string | null;
          org_id?: string;
          player_id?: string | null;
          recorded_by?: string | null;
          team_id?: string | null;
          value?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'entries_leaderboard_id_org_id_fkey';
            columns: ['leaderboard_id', 'org_id'];
            isOneToOne: false;
            referencedRelation: 'leaderboards';
            referencedColumns: ['id', 'org_id'];
          },
          {
            foreignKeyName: 'entries_player_id_org_id_fkey';
            columns: ['player_id', 'org_id'];
            isOneToOne: false;
            referencedRelation: 'players';
            referencedColumns: ['id', 'org_id'];
          },
          {
            foreignKeyName: 'entries_recorded_by_fkey';
            columns: ['recorded_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'entries_team_id_org_id_fkey';
            columns: ['team_id', 'org_id'];
            isOneToOne: false;
            referencedRelation: 'teams';
            referencedColumns: ['id', 'org_id'];
          },
        ];
      };
      leaderboards: {
        Row: {
          aggregation: string;
          archived_at: string | null;
          config: NonNullable<Json>;
          created_at: string;
          created_by: string | null;
          decimals: number;
          default_attempts: number | null;
          default_window: string;
          description: string | null;
          direction: string;
          entrant_type: string;
          icon: string;
          id: string;
          metric_type: string;
          name: string;
          org_id: string;
          team_size: number | null;
          unit: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          aggregation: string;
          archived_at?: string | null;
          config?: NonNullable<Json>;
          created_at?: string;
          created_by?: string | null;
          decimals?: number;
          default_attempts?: number | null;
          default_window?: string;
          description?: string | null;
          direction: string;
          entrant_type?: string;
          icon?: string;
          id?: string;
          metric_type: string;
          name: string;
          org_id: string;
          team_size?: number | null;
          unit: string;
          updated_at?: string;
        };
        Update: {
          aggregation?: string;
          archived_at?: string | null;
          config?: NonNullable<Json>;
          created_at?: string;
          created_by?: string | null;
          decimals?: number;
          default_attempts?: number | null;
          default_window?: string;
          description?: string | null;
          direction?: string;
          entrant_type?: string;
          icon?: string;
          id?: string;
          metric_type?: string;
          name?: string;
          org_id?: string;
          team_size?: number | null;
          unit?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'leaderboards_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'leaderboards_org_id_fkey';
            columns: ['org_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      org_invites: {
        Row: {
          code: string;
          created_at: string;
          created_by: string | null;
          expires_at: string | null;
          id: string;
          max_uses: number | null;
          org_id: string;
          player_id: string | null;
          role: string;
          use_count: number;
        };
        ComputedFields: never;
        Insert: {
          code?: string;
          created_at?: string;
          created_by?: string | null;
          expires_at?: string | null;
          id?: string;
          max_uses?: number | null;
          org_id: string;
          player_id?: string | null;
          role?: string;
          use_count?: number;
        };
        Update: {
          code?: string;
          created_at?: string;
          created_by?: string | null;
          expires_at?: string | null;
          id?: string;
          max_uses?: number | null;
          org_id?: string;
          player_id?: string | null;
          role?: string;
          use_count?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'org_invites_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'org_invites_org_id_fkey';
            columns: ['org_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'org_invites_player_id_org_id_fkey';
            columns: ['player_id', 'org_id'];
            isOneToOne: false;
            referencedRelation: 'players';
            referencedColumns: ['id', 'org_id'];
          },
        ];
      };
      org_members: {
        Row: {
          created_at: string;
          org_id: string;
          role: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          org_id: string;
          role?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          org_id?: string;
          role?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'org_members_org_id_fkey';
            columns: ['org_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'org_members_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      organizations: {
        Row: {
          created_at: string;
          created_by: string | null;
          id: string;
          name: string;
          slug: string;
          timezone: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          name: string;
          slug: string;
          timezone?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          name?: string;
          slug?: string;
          timezone?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'organizations_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      platform_admins: {
        Row: {
          created_at: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'platform_admins_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      players: {
        Row: {
          avatar: string;
          created_at: string;
          created_by: string | null;
          display_name: string;
          id: string;
          org_id: string;
          updated_at: string;
          user_id: string | null;
        };
        ComputedFields: never;
        Insert: {
          avatar?: string;
          created_at?: string;
          created_by?: string | null;
          display_name: string;
          id?: string;
          org_id: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          avatar?: string;
          created_at?: string;
          created_by?: string | null;
          display_name?: string;
          id?: string;
          org_id?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'players_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'players_org_id_fkey';
            columns: ['org_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'players_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          avatar: string;
          created_at: string;
          display_name: string;
          email: string;
          id: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          avatar?: string;
          created_at?: string;
          display_name: string;
          email: string;
          id: string;
          updated_at?: string;
        };
        Update: {
          avatar?: string;
          created_at?: string;
          display_name?: string;
          email?: string;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      team_members: {
        Row: {
          org_id: string;
          player_id: string;
          team_id: string;
        };
        ComputedFields: never;
        Insert: {
          org_id: string;
          player_id: string;
          team_id: string;
        };
        Update: {
          org_id?: string;
          player_id?: string;
          team_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'team_members_player_id_org_id_fkey';
            columns: ['player_id', 'org_id'];
            isOneToOne: false;
            referencedRelation: 'players';
            referencedColumns: ['id', 'org_id'];
          },
          {
            foreignKeyName: 'team_members_team_id_org_id_fkey';
            columns: ['team_id', 'org_id'];
            isOneToOne: false;
            referencedRelation: 'teams';
            referencedColumns: ['id', 'org_id'];
          },
        ];
      };
      teams: {
        Row: {
          created_at: string;
          created_by: string | null;
          id: string;
          name: string | null;
          org_id: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          name?: string | null;
          org_id: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          name?: string | null;
          org_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'teams_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'teams_org_id_fkey';
            columns: ['org_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      accept_invite: { Args: { p_code: string }; Returns: string };
      claim_player: { Args: { p_player_id: string }; Returns: undefined };
      create_organization: {
        Args: { p_name: string; p_slug: string; p_timezone?: string };
        Returns: string;
      };
      ensure_my_player: { Args: { p_org_id: string }; Returns: string };
      find_or_create_team: {
        Args: { p_name?: string; p_org_id: string; p_player_ids: string[] };
        Returns: string;
      };
      get_display: { Args: { p_token: string }; Returns: Json };
      get_invite: {
        Args: { p_code: string };
        Returns: {
          is_valid: boolean;
          org_id: string;
          org_name: string;
          player_name: string;
          role: string;
        }[];
      };
      has_org_role: { Args: { p_org_id: string; p_roles: string[] }; Returns: boolean };
      is_entrant_user: { Args: { p_player_id: string; p_team_id: string }; Returns: boolean };
      is_org_member: { Args: { p_org_id: string }; Returns: boolean };
      is_platform_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      leaderboard_standings: {
        Args: { p_from?: string; p_leaderboard_id: string; p_to?: string; p_window?: string };
        Returns: {
          attempts: number;
          entry_count: number;
          last_achieved_at: string;
          made: number;
          player_id: string;
          rank: number;
          score: number;
          team_id: string;
        }[];
      };
      shares_org_with: { Args: { p_user_id: string }; Returns: boolean };
      window_start: {
        Args: { p_at?: string; p_timezone: string; p_window: string };
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
