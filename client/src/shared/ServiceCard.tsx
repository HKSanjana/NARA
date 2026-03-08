import { LucideIcon } from "lucide-react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
}

export default function ServiceCard({ icon: Icon, title, description, href }: ServiceCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 card-hover">
      <div className="bg-nara-light p-4 rounded-lg w-16 h-16 flex items-center justify-center mb-6">
        <Icon className="text-nara-navy w-8 h-8" />
      </div>
      <h3 className="text-xl font-semibold text-nara-navy mb-4">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      <Link href={href}>
        <span className="text-nara-blue font-medium hover:underline flex items-center cursor-pointer">
          Learn More <ArrowRight className="ml-2 w-4 h-4" />
        </span>
      </Link>
    </div>
  );
}
