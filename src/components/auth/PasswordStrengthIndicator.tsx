
import React from 'react';
import { checkPasswordStrength } from '@/utils/securityUtils';

interface PasswordStrengthIndicatorProps {
  password: string;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  const { score, feedback } = checkPasswordStrength(password);

  const getColorClass = () => {
    switch (score) {
      case 0:
      case 1:
        return 'bg-red-500';
      case 2:
        return 'bg-yellow-500';
      case 3:
      case 4:
        return 'bg-green-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getWidthClass = () => {
    switch (score) {
      case 0:
      case 1:
        return 'w-1/3';
      case 2:
        return 'w-2/3';
      case 3:
      case 4:
        return 'w-full';
      default:
        return 'w-0';
    }
  };

  const getStrengthText = () => {
    switch (score) {
      case 0:
      case 1:
        return 'weak';
      case 2:
        return 'medium';
      case 3:
      case 4:
        return 'strong';
      default:
        return '';
    }
  };

  const strength = getStrengthText();

  return (
    <div className="mt-1">
      <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full ${getColorClass()} ${getWidthClass()}`}></div>
      </div>
      <p className={`text-xs mt-1 ${
        strength === 'weak' ? 'text-red-600' : 
        strength === 'medium' ? 'text-yellow-600' : 'text-green-600'
      }`}>
        {feedback}
      </p>
    </div>
  );
};

export default PasswordStrengthIndicator;
