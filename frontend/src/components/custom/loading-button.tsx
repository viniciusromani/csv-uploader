import { Loader2 } from 'lucide-react';
import { Button, ButtonProps } from '@/components/shadcn';
import { forwardRef } from 'react';

type LoadingButtonProps = ButtonProps & {
  loading?: boolean;
};

const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  function LoadingButton({ loading, children, ...props }, ref) {
    const isLoading = loading ?? false;

    return (
      <Button ref={ref} disabled={isLoading} {...props}>
        <>
          {isLoading ? 'Please wait' : children}
          {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
        </>
      </Button>
    );
  },
);

LoadingButton.displayName = 'LoadingButton';

export { LoadingButton };
