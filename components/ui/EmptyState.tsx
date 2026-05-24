import React from 'react'
import { Icon } from '../icons/Icon'
import type { IconName } from '../icons/Icon'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from './empty'

interface EmptyStateProps {
  icon?: IconName
  title: string
  message?: string
  action?: React.ReactNode
}

export function EmptyState({ icon = 'package', title, message, action }: EmptyStateProps) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon name={icon} size={24} stroke="#9ca3af" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        {message && <EmptyDescription>{message}</EmptyDescription>}
      </EmptyHeader>
      {action && <EmptyContent>{action}</EmptyContent>}
    </Empty>
  )
}
