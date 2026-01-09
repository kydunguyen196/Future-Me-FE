import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface Module {
  id: string;
  name: string;
  content: React.ReactNode;
}

interface ModuleSwitchProps {
  modules: Module[];
  activeModuleId: string;
  onModuleChange: (moduleId: string) => void;
}

/**
 * Component that allows switching between test modules
 */
const ModuleSwitch: React.FC<ModuleSwitchProps> = ({
  modules,
  activeModuleId,
  onModuleChange,
}) => {
  return (
    <Tabs value={activeModuleId} onValueChange={onModuleChange} className="w-full">
      <TabsList className="grid grid-cols-2 w-full mb-6">
        {modules.map((module) => (
          <TabsTrigger key={module.id} value={module.id}>
            {module.name}
          </TabsTrigger>
        ))}
      </TabsList>
      
      {modules.map((module) => (
        <TabsContent key={module.id} value={module.id}>
          {module.content}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default ModuleSwitch; 