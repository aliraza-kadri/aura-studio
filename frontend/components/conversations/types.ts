import type { Conversation, Customer, Message } from '@/types/database'

export interface ConversationWithCustomer extends Conversation {
  customer?: Customer | null
}

export type { Message }
