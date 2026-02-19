import { Ionicons } from '@expo/vector-icons'
import type { ComponentProps } from 'react'

export type IoniconName = ComponentProps<typeof Ionicons>['name']
// estructura
export type Badge = {
  id: number
  icon: IoniconName
  earned: boolean
}
