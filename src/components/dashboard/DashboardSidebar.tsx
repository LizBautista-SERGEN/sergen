
import { User, Plug, Book, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const links = [
  { 
    label: "Perfil", 
    href: "/perfil",
    icon: <User className="text-neutral-700 dark:text-neutral-200 h-6 w-6 flex-shrink-0" />
  },
  { 
    label: "Gestión Energética", 
    href: "/gestion",
    icon: <Plug className="text-neutral-700 dark:text-neutral-200 h-6 w-6 flex-shrink-0" />
  },
  { 
    label: "Cápsulas", 
    href: "/capsulas",
    icon: <Book className="text-neutral-700 dark:text-neutral-200 h-6 w-6 flex-shrink-0" />
  },
  { 
    label: "Informes", 
    href: "/informes",
    icon: <FileText className="text-neutral-700 dark:text-neutral-200 h-6 w-6 flex-shrink-0" />
  }
];

const SidebarLink = ({ link, isOpen }: { link: typeof links[0], isOpen: boolean }) => {
  const navigate = useNavigate();
  
  return (
    <button
      onClick={() => navigate(link.href)}
      className="flex items-center justify-start gap-3 group/sidebar py-4 w-full hover:bg-gray-100 rounded-lg px-4"
    >
      {link.icon}
      <motion.span
        animate={{
          display: isOpen ? "inline-block" : "none",
          opacity: isOpen ? 1 : 0,
        }}
        className="text-neutral-700 dark:text-neutral-200 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block"
      >
        {link.label}
      </motion.span>
    </button>
  );
};

export const DashboardSidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <motion.div
      className={cn(
        "h-full px-4 py-6 flex flex-col bg-white border-r border-gray-200 transition-all",
      )}
      animate={{
        width: isOpen ? "300px" : "80px",
      }}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <motion.div 
          className="border-b pb-4"
          animate={{
            display: isOpen ? "block" : "none",
            opacity: isOpen ? 1 : 0,
          }}
        >
          <h2 className="text-lg font-semibold px-3 text-white">Menu</h2>
        </motion.div>
        <motion.div 
          className="mt-8 flex flex-col gap-4"
          animate={{
            marginTop: isOpen ? "2rem" : "4rem"
          }}
        >
          {links.map((link, idx) => (
            <SidebarLink key={idx} link={link} isOpen={isOpen} />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

