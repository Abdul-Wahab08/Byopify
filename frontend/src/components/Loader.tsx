import { LoaderIcon } from "lucide-react";

const Loader = () => {
  return (
    <div className="flex h-screen items-center justify-center">
      <LoaderIcon className="size-10 animate-spin text-primary" />
    </div>
  );
};

export default Loader;