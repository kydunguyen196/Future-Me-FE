import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '../ui/card';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import LatexRenderer from './LatexRenderer';

interface Option {
  id: string;
  text: string;
  hasLatex?: boolean;
}

interface TestQuestionProps {
  questionNumber: number;
  questionText: string;
  options: Option[];
  selectedOption: string | null;
  onSelectOption: (optionId: string) => void;
  hasLatex?: boolean;
}

/**
 * Component that displays a test question with options and LaTeX support
 */
const TestQuestion: React.FC<TestQuestionProps> = ({
  questionNumber,
  questionText,
  options,
  selectedOption,
  onSelectOption,
}) => {
  const { t } = useTranslation();
  
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">{t('tests.testPart.question')} {questionNumber}:</h3>
          <div className="text-base">
            <LatexRenderer content={questionText} block={true} />
          </div>
        </div>
        
        <RadioGroup value={selectedOption || ""} onValueChange={onSelectOption} className="space-y-3">
          {options.map((option) => (
            <div key={option.id} className="flex items-start space-x-2">
              <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
              <Label htmlFor={option.id} className="text-base font-normal cursor-pointer w-full">
                <LatexRenderer content={option.text} />
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default TestQuestion; 