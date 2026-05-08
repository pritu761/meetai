interface Props {
  title: string;
  description?: string;
}

export const LoadingState = ({ title, description }: Props) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm pl-56">
      <div className="flex flex-col items-center justify-center rounded-lg border bg-background p-8 shadow-lg">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
        <h2 className="mt-4 text-lg font-semibold">{title}</h2>
        {description && (
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
};
