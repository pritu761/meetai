import "@stream-io/video-react-sdk/dist/css/styles.css";
import type { ReactNode } from "react";

interface Props {
    children: ReactNode;
}

const CallLayout = ({ children }: Props) => {
    return (
        <div className="h-screen bg-black">
            {children}
        </div>
    );
};

export default CallLayout;
