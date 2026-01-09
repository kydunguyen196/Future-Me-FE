import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

interface TestModuleCardProps {
  title: string;
  description: string;
  parts: number;
  questionsPerPart: number;
  timePerPart: number;
  onStart: () => void;
}

/**
 * Component that displays a test module card with information and start button
 */
const TestModuleCard: React.FC<TestModuleCardProps> = ({
  title,
  description,
  parts,
  questionsPerPart,
  timePerPart,
  onStart,
}) => {
  const { t } = useTranslation();
  
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">{t('tests.moduleCard.parts')}:</span>
            <span className="text-sm font-medium">{parts}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">{t('tests.moduleCard.questionsPerPart')}:</span>
            <span className="text-sm font-medium">{questionsPerPart}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">{t('tests.moduleCard.timePerPart')}:</span>
            <span className="text-sm font-medium">{timePerPart} {t('tests.minutes')}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={onStart} className="w-full">{t('tests.moduleCard.startModule')}</Button>
      </CardFooter>
    </Card>
  );
};

export default TestModuleCard; 