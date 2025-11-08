export interface Task {
  title: string
  description: string
  completed: boolean
}

export interface Roadmap {
  legal: Task[]
  finance: Task[]
  marketing: Task[]
  launch: Task[]
}

export interface Experts {
  legalAdvisor: string
  financeAnalyst: string
  marketingStrategist: string
}

export interface Cost {
  category: string
  initial: number
  monthly: number
  note: string
}

export interface Market {
  viabilityScore: number
  insights: string[]
}

export interface Brand {
  names: string[]
  tagline: string
  pitch: string
}

export interface GeneratedPlan {
  roadmap: Roadmap
  experts: Experts
  costs: Cost[]
  fundingSuggestions: string[]
  market: Market
  brand: Brand
}
