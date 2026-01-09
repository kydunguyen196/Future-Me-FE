import { useState } from 'react';
import { Button } from './button';
import { MessageCircle, Phone, Headset, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './tooltip';
import { ChatDialog } from './chat-dialog';

export function FloatingButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { t } = useTranslation();

  // Animation classes for the floating buttons
  const buttonAnimationClasses = "transition-all duration-300 ease-in-out transform";
  const openAnimationClasses = "scale-100 translate-y-0 opacity-100";
  const closedAnimationClasses = "scale-95 translate-y-10 opacity-0 pointer-events-none";

  const handleMainButtonClick = () => {
    if (isChatOpen) {
      setIsChatOpen(false);
      setTimeout(() => setIsOpen(true), 200);
    } else {
      setIsOpen(!isOpen);
    }
  };

  const handleChatButtonClick = () => {
    setIsOpen(false);
    setTimeout(() => setIsChatOpen(true), 200);
  };

  return (
    <TooltipProvider>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        <div
          className={cn(
            "flex flex-col gap-3 items-center",
            buttonAnimationClasses,
            isOpen ? openAnimationClasses : closedAnimationClasses
          )}
        >
          {/* Chat Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                size="icon"
                className="w-12 h-12 rounded-full bg-[#4285F4] hover:bg-blue-600 transition-all duration-200 hover:scale-105 hover:shadow-xl flex items-center justify-center"
                onClick={handleChatButtonClick}
              >
                <MessageCircle className="size-6 text-white" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>{t('customerService.chatButton')}</p>
            </TooltipContent>
          </Tooltip>

          {/* Call Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                size="icon"
                className="w-12 h-12 rounded-full bg-[#34A853] hover:bg-green-600 transition-all duration-200 hover:scale-105 hover:shadow-xl flex items-center justify-center"
                onClick={() => {
                  window.location.href = 'tel:+1234567890';
                }}
              >
                <Phone className="size-6 text-white" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Call us at: +1234567890</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Main floating button */}
        <Button
          variant="default"
          size="icon"
          className={cn(
            "w-12 h-12 rounded-full bg-[#2A2A2A] hover:bg-[#3A3A3A] transition-all duration-300 flex items-center justify-center",
            buttonAnimationClasses,
            "hover:scale-105 hover:shadow-xl"
          )}
          onClick={handleMainButtonClick}
          title={t('customerService.mainButton')}
        >
          {(isOpen || isChatOpen) ? (
            <X className="size-6 text-white" />
          ) : (
            <Headset className="size-6 text-white" />
          )}
        </Button>

        {/* Chat Dialog */}
        <ChatDialog 
          isOpen={isChatOpen} 
          onClose={() => {
            setIsChatOpen(false);
            setIsOpen(false);
          }} 
        />
      </div>
    </TooltipProvider>
  );
} 