import type { Model } from '../types'

export const MODELS: Model[] = [
  {
    id: 'llama-3.3-70b-versatile',
    label: 'Llama 3.3 70B',
    description: 'Fast and capable',
    badge: 'Latest',
  },
  {
    id: 'llama-3.1-8b-instant',
    label: 'Llama 3.1 8B',
    description: 'Ultra fast',
  },
  {
    id: 'mixtral-8x7b-32768',
    label: 'Mixtral 8x7B',
    description: 'Large context',
  },
]

export const SAMPLE_PROMPTS = [
  'Explain the transformer attention mechanism in simple terms.',
  'What are the tradeoffs between REST and GraphQL?',
  'Write a haiku about distributed systems.',
  'Explain the CAP theorem with a real-world example.',
  'What is the difference between concurrency and parallelism?',
  'Describe the butterfly effect and give a concrete example.',
]

export const SAMPLE_SYSTEM_PROMPTS = [
  'You are a helpful, concise AI assistant. Provide clear and accurate responses.',
  'You are a creative writing assistant. Help users craft engaging stories and poems.',
  'You are a code review assistant. Provide constructive feedback on code quality and best practices.'
]
