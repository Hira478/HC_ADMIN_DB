// File: /components/ui/InfoTooltip.tsx

"use client";

import { Popover, Transition } from "@headlessui/react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { Fragment } from "react";

interface InfoTooltipProps {
  content: string | React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({
  content,
  position = "bottom",
}) => {
  const positionClasses = {
    top: "bottom-full mb-2",
    bottom: "top-full mt-2",
    left: "right-full mr-2",
    right: "left-full ml-2",
  };

  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button
            className="outline-none"
            aria-label="More information"
          >
            <InformationCircleIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </Popover.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel
              className={`absolute z-10 w-64 p-3 mt-2 text-sm text-white bg-gray-800 rounded-lg shadow-lg ${positionClasses[position]}`}
            >
              <div className="relative">
                {typeof content === "string" ? <p>{content}</p> : content}
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
};

export default InfoTooltip;
