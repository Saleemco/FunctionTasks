import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    HomeIcon,
    UsersIcon,
    AcademicCapIcon,
    CurrencyDollarIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    BookOpenIcon,
} from "@heroicons/react/24/outline";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
    { name: "Students", href: "/students", icon: UsersIcon },
    { name: "Teachers", href: "/teachers", icon: AcademicCapIcon },
    { name: "Classes", href: "/classes", icon: AcademicCapIcon },
    { name: "Subjects", href: "/subjects", icon: BookOpenIcon },
    { name: "Results", href: "/results", icon: ChartBarIcon },
    { name: "Fees", href: "/fees", icon: CurrencyDollarIcon },
    { name: "Settings", href: "/settings", icon: Cog6ToothIcon },
];

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
    const { user } = useAuth();

    const getFeesHref = () => {
        if (user?.role === "PARENT") {
            return "/parent-fees";
        }
        return "/fees";
    };

    const filteredNavigation = navigation.filter(item => {
        // Admin and Principal can see everything
        if (user?.role === "ADMIN" || user?.role === "PRINCIPAL") {
            return true;
        }
        
        // Parent restrictions
        if (user?.role === "PARENT") {
            return ["Dashboard", "Results", "Fees"].includes(item.name);
        }
        
        // Teacher restrictions
        if (user?.role === "TEACHER" || user?.role === "CLASS_TEACHER") {
            return ["Dashboard", "Students", "Results", "Classes"].includes(item.name);
        }
        
        // Bursar restrictions
        if (user?.role === "BURSAR") {
            return ["Dashboard", "Fees"].includes(item.name);
        }
        
        return true;
    });

    return (
        <>
            <Transition.Root show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50 lg:hidden" onClose={onClose}>
                    <Transition.Child
                        as={Fragment}
                        enter="transition-opacity ease-linear duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition-opacity ease-linear duration-300"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-900/80" />
                    </Transition.Child>

                    <div className="fixed inset-0 flex">
                        <Transition.Child
                            as={Fragment}
                            enter="transition ease-in-out duration-300 transform"
                            enterFrom="-translate-x-full"
                            enterTo="translate-x-0"
                            leave="transition ease-in-out duration-300 transform"
                            leaveFrom="translate-x-0"
                            leaveTo="-translate-x-full"
                        >
                            <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-in-out duration-300"
                                    enterFrom="opacity-0"
                                    enterTo="opacity-100"
                                    leave="ease-in-out duration-300"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                >
                                    <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                                        <button type="button" className="-m-2.5 p-2.5" onClick={onClose}>
                                            <span className="sr-only">Close sidebar</span>
                                            <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                                        </button>
                                    </div>
                                </Transition.Child>
                                <SidebarContent navigation={filteredNavigation} getFeesHref={getFeesHref} />
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition.Root>

            <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
                <SidebarContent navigation={filteredNavigation} getFeesHref={getFeesHref} />
            </div>
        </>
    );
};

const SidebarContent = ({ navigation, getFeesHref }: { navigation: typeof navigation, getFeesHref: () => string }) => (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 border-r border-gray-200">
        <div className="flex h-16 shrink-0 items-center">
            <img
                className="h-8 w-auto"
                src="/vite.svg"
                alt="School Management"
            />
            <span className="ml-2 text-xl font-semibold text-gray-900">SchoolMS</span>
        </div>
        <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                    <ul role="list" className="-mx-2 space-y-1">
                        {navigation.map((item) => {
                            const href = item.name === "Fees" ? getFeesHref() : item.href;

                            return (
                                <li key={item.name}>
                                    <NavLink
                                        to={href}
                                        className={({ isActive }) => {
                                            return 'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold ' +
                                                (isActive ? 'bg-gray-50 text-indigo-600' : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50');
                                        }}
                                    >
                                        <item.icon className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-indigo-600" aria-hidden="true" />
                                        {item.name}
                                    </NavLink>
                                </li>
                            );
                        })}
                    </ul>
                </li>
            </ul>
        </nav>
    </div>
);

export default Sidebar;
