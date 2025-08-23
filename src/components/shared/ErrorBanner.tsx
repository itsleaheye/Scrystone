import { MdError } from "react-icons/md";

interface ErrorBannerProps {
  message: string;
}

export function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <div className="errorBanner flexRow">
      <MdError />
      <p>{message}</p>
    </div>
  );
}
