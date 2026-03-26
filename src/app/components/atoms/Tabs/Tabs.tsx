'use client';

import React from 'react';
import { Tabs as RadixTabs, TabsList, TabsTrigger } from '@/app/components/ui/tabs';

export interface Tab {
  id: string;
  label: string;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className,
}) => {
  return (
    <RadixTabs value={activeTab} onValueChange={onTabChange}>
      <TabsList className={className}>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </RadixTabs>
  );
};

Tabs.displayName = 'Tabs';
